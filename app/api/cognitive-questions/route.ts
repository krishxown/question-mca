import { type NextRequest, NextResponse } from "next/server"
import type { QuestionRequestParams, QuestionResponse } from "@/types/questions"

export const dynamic = "force-dynamic" // Ensure the route is not cached

/**
 * API endpoint to fetch questions based on cognitive state
 *
 * Communicates with the ML backend to get tailored questions based on
 * the candidate's cognitive state as determined by webcam analysis
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const requestData: QuestionRequestParams = await request.json()

    // Validate required fields
    if (!requestData.cognitiveState || !requestData.subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: cognitiveState and subject are required",
        },
        { status: 400 },
      )
    }

    // Log the cognitive state (useful for debugging)
    console.log("Cognitive state for question retrieval:", {
      attention: requestData.cognitiveState.attention,
      fatigue: requestData.cognitiveState.fatigue,
      confidence: requestData.cognitiveState.confidence,
      questionId: requestData.cognitiveState.questionId || "N/A",
      subject: requestData.subject,
    })

    // Set up request to backend ML service
    const backendUrl = "http://127.0.0.1:8000/api/quiz/get_question"

    // Implement retry logic for network resilience
    const maxRetries = 3
    let retryCount = 0
    let backendResponse = null

    while (retryCount < maxRetries) {
      try {
        backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
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
        console.error("Error connecting to question retrieval backend:", error)
        retryCount++

        // Wait before retrying
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    // If we couldn't connect to the backend after all retries
    if (!backendResponse) {
      console.error("Failed to connect to question retrieval backend after multiple attempts")
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to question service. Please try again later.",
        },
        { status: 503 },
      )
    }

    // If the backend returned an error
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Question retrieval backend error:", errorText)

      // Determine the appropriate error message based on status code
      let errorMessage = "Failed to retrieve question from the backend service."
      if (backendResponse.status === 404) {
        errorMessage = "No suitable questions found for the given parameters."
      } else if (backendResponse.status === 401 || backendResponse.status === 403) {
        errorMessage = "Not authorized to access the question service."
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
    const questionData: QuestionResponse = await backendResponse.json()

    // Ensure the question has the required fields
    if (!questionData.question) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid question data returned from the backend",
        },
        { status: 502 },
      )
    }

    // Return success response with the question data
    return NextResponse.json({
      success: true,
      ...questionData,
    })
  } catch (error) {
    console.error("Error in cognitive-questions API:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error retrieving question",
      },
      { status: 500 },
    )
  }
}

/**
 * Fallback GET handler that returns information about the endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: "This endpoint requires a POST request with cognitive state data",
      documentation: "/docs/cognitive-questions-api.md",
    },
    { status: 405 },
  )
}
