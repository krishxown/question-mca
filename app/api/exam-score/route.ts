import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Ensure the route is not cached

/**
 * API endpoint to fetch exam scores from the backend
 *
 * @param {NextRequest} request - The incoming request with query parameters
 * @returns {NextResponse} Response with the exam score data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const userId = searchParams.get("userId")
    const sessionId = searchParams.get("sessionId")
    const subject = searchParams.get("subject")

    // Validate required parameters
    if (!examId && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: either examId or sessionId is required",
        },
        { status: 400 },
      )
    }

    // Construct the backend URL with query parameters
    const backendUrl = new URL("http://127.0.0.1:8000/api/quiz/marks")

    // Add all valid parameters to the backend request
    if (examId) backendUrl.searchParams.append("examId", examId)
    if (userId) backendUrl.searchParams.append("userId", userId)
    if (sessionId) backendUrl.searchParams.append("sessionId", sessionId)
    if (subject) backendUrl.searchParams.append("subject", subject)

    // Implement retry logic for network resilience
    const maxRetries = 3
    let retryCount = 0
    let backendResponse = null

    while (retryCount < maxRetries) {
      try {
        backendResponse = await fetch(backendUrl.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Set a reasonable timeout
          signal: AbortSignal.timeout(5000), // 5 second timeout
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
        console.error("Error connecting to score retrieval backend:", error)
        retryCount++

        // Wait before retrying
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    // If we couldn't connect to the backend after all retries
    if (!backendResponse) {
      console.error("Failed to connect to score retrieval backend after multiple attempts")
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to score service. Please try again later.",
        },
        { status: 503 },
      )
    }

    // If the backend returned an error
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Score retrieval backend error:", errorText)

      // Determine the appropriate error message based on status code
      let errorMessage = "Failed to retrieve score from the backend service."
      if (backendResponse.status === 404) {
        errorMessage = "No score found for the given parameters."
      } else if (backendResponse.status === 401 || backendResponse.status === 403) {
        errorMessage = "Not authorized to access the score service."
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          details: errorText,
        },
        { status: backendResponse.status },
      )
    }

    // Parse the backend response
    const scoreData = await backendResponse.json()

    // Return success response with the score data
    return NextResponse.json({
      success: true,
      ...scoreData,
    })
  } catch (error) {
    console.error("Error in exam-score API:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error retrieving score",
      },
      { status: 500 },
    )
  }
}
