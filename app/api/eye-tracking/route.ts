import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Ensure the route is not cached

/**
 * API endpoint to handle eye tracking data
 *
 * Receives images captured during exam questions and forwards them
 * to the backend API for processing
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData()

    // Get the question ID
    const questionId = formData.get("questionId")

    if (!questionId) {
      return NextResponse.json({ success: false, error: "Missing questionId" }, { status: 400 })
    }

    // Get all images and timestamps
    const images = formData.getAll("images")
    const timestamps = formData.getAll("timestamps")

    if (!images.length) {
      return NextResponse.json({ success: false, error: "No images provided" }, { status: 400 })
    }

    console.log(`Received ${images.length} eye tracking images for question ${questionId}`)

    // Create a new FormData to send to the backend
    const backendFormData = new FormData()
    backendFormData.append("questionId", questionId.toString())

    // Add all images and timestamps to the backend form data
    images.forEach((image, index) => {
      if (image instanceof File) {
        backendFormData.append("images", image)

        // Add corresponding timestamp if available
        if (timestamps[index]) {
          backendFormData.append("timestamps", timestamps[index].toString())
        }
      }
    })

    // Send the data to the backend API
    const backendUrl = "http://127.0.0.1:8000/api/quiz/submit-eye-data"

    // Implement retry logic for network resilience
    const maxRetries = 3
    let retryCount = 0
    let backendResponse = null

    while (retryCount < maxRetries) {
      try {
        backendResponse = await fetch(backendUrl, {
          method: "POST",
          body: backendFormData,
          // Don't set Content-Type header - fetch will set it correctly with boundary for multipart/form-data
        })

        // If successful, break out of retry loop
        if (backendResponse.ok) break

        // If we get a 4xx error, don't retry (client error)
        if (backendResponse.status >= 400 && backendResponse.status < 500) {
          break
        }

        // Otherwise, increment retry count
        retryCount++

        // Wait before retrying (exponential backoff)
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      } catch (error) {
        console.error("Error sending data to backend:", error)
        retryCount++

        // Wait before retrying
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    // If we couldn't connect to the backend after all retries
    if (!backendResponse) {
      console.error("Failed to connect to backend API after multiple attempts")
      return NextResponse.json({ success: false, error: "Failed to connect to backend API" }, { status: 503 })
    }

    // If the backend returned an error
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend API error:", errorText)

      return NextResponse.json(
        {
          success: false,
          error: "Backend API error",
          status: backendResponse.status,
          details: errorText,
        },
        { status: 502 },
      )
    }

    // Parse the backend response
    const backendData = await backendResponse.json()

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${images.length} eye tracking images for question ${questionId}`,
      backendResponse: backendData,
    })
  } catch (error) {
    console.error("Error in eye-tracking API:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
