import { type NextRequest, NextResponse } from "next/server"
import { getErrorResponse } from "@/lib/api-utils"
import { captureImageLog, storeWebcamImage } from "@/lib/webcam-service"

export const maxDuration = 30 // Set max duration to 30 seconds
export const dynamic = "force-dynamic" // Ensure the route is not cached

/**
 * API endpoint to handle webcam image uploads
 *
 * Processes images captured during an assessment question
 * Stores images securely and maintains audit logs
 *
 * @param {NextRequest} request - The incoming request with image data
 * @returns {NextResponse} Response indicating success or failure
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract and validate request data
    const formData = await request.formData()

    // Get required parameters from the request
    const userId = formData.get("userId")
    const examId = formData.get("examId")
    const questionId = formData.get("questionId")
    const sessionId = formData.get("sessionId")
    const timestamp = formData.get("timestamp")
    const image = formData.get("image") as File | null

    // Validate required fields
    if (!userId || !examId || !questionId || !sessionId || !image) {
      return getErrorResponse("Missing required fields", 400)
    }

    // Validate image type
    if (!image.type.startsWith("image/")) {
      return getErrorResponse("Invalid file type. Only images are allowed.", 400)
    }

    // Process and store the image
    const imageUrl = await storeWebcamImage({
      userId: userId.toString(),
      examId: examId.toString(),
      questionId: questionId.toString(),
      sessionId: sessionId.toString(),
      timestamp: timestamp ? Number(timestamp) : Date.now(),
      image,
    })

    // Log the successful capture (for audit and monitoring)
    await captureImageLog({
      userId: userId.toString(),
      examId: examId.toString(),
      questionId: questionId.toString(),
      sessionId: sessionId.toString(),
      timestamp: timestamp ? Number(timestamp) : Date.now(),
      imageUrl,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image captured and stored successfully",
    })
  } catch (error) {
    console.error("Error in webcam monitoring API:", error)

    // Determine if it's a known error type
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const statusCode = errorMessage.includes("exceeded") ? 413 : 500

    return getErrorResponse(errorMessage, statusCode)
  }
}

/**
 * Handles GET requests to retrieve webcam images for a session
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)

    // Get required parameters
    const userId = searchParams.get("userId")
    const examId = searchParams.get("examId")
    const questionId = searchParams.get("questionId")
    const sessionId = searchParams.get("sessionId")

    // Validate required parameters
    if (!userId || !examId || !sessionId) {
      return getErrorResponse("Missing required parameters", 400)
    }

    // Import the retrieval function dynamically to avoid loading it unnecessarily
    const { getWebcamImages } = await import("@/lib/webcam-service")

    // Retrieve images based on parameters
    const images = await getWebcamImages({
      userId: userId.toString(),
      examId: examId.toString(),
      questionId: questionId ? questionId.toString() : undefined,
      sessionId: sessionId.toString(),
    })

    // Return the retrieved images
    return NextResponse.json({ success: true, images })
  } catch (error) {
    console.error("Error retrieving webcam images:", error)
    return getErrorResponse("Failed to retrieve webcam images", 500)
  }
}
