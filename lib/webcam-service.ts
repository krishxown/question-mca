import { put } from "@vercel/blob"
import { createHash } from "crypto"

// Types for the webcam monitoring service
export interface WebcamImageData {
  userId: string
  examId: string
  questionId: string
  sessionId: string
  timestamp: number
  image: File
}

export interface WebcamImageLog {
  userId: string
  examId: string
  questionId: string
  sessionId: string
  timestamp: number
  imageUrl: string
}

export interface WebcamImageQuery {
  userId: string
  examId: string
  questionId?: string
  sessionId: string
}

/**
 * Stores a webcam image in secure blob storage
 *
 * @param {WebcamImageData} data - Image data to store
 * @returns {Promise<string>} URL of the stored image
 */
export async function storeWebcamImage(data: WebcamImageData): Promise<string> {
  try {
    // Create a unique filename for the image based on the data
    const filename = generateUniqueImageFilename(data)

    // Store the image in Vercel Blob storage (or your preferred storage service)
    const { url } = await put(filename, data.image, {
      access: "private",
      addRandomSuffix: false, // We're already using a hash for uniqueness
    })

    return url
  } catch (error) {
    console.error("Error storing webcam image:", error)
    throw new Error("Failed to store webcam image")
  }
}

/**
 * Logs the capture of an image for audit purposes
 *
 * @param {WebcamImageLog} logData - Data to log
 */
export async function captureImageLog(logData: WebcamImageLog): Promise<void> {
  try {
    // In a production environment, store this in a database
    // For example, using a database client:
    //
    // await db.webcamLogs.create({
    //   data: {
    //     userId: logData.userId,
    //     examId: logData.examId,
    //     questionId: logData.questionId,
    //     sessionId: logData.sessionId,
    //     timestamp: new Date(logData.timestamp),
    //     imageUrl: logData.imageUrl
    //   }
    // })

    console.log("Webcam image captured:", {
      userId: logData.userId,
      examId: logData.examId,
      questionId: logData.questionId,
      sessionId: logData.sessionId,
      timestamp: new Date(logData.timestamp).toISOString(),
      imageUrl: logData.imageUrl,
    })
  } catch (error) {
    console.error("Error logging webcam capture:", error)
    // Don't throw here to prevent blocking the main flow
  }
}

/**
 * Retrieves webcam images for a specific session or question
 *
 * @param {WebcamImageQuery} query - Query parameters
 * @returns {Promise<Array<{url: string, timestamp: number}>>} List of image URLs and timestamps
 */
export async function getWebcamImages(query: WebcamImageQuery): Promise<Array<{ url: string; timestamp: number }>> {
  try {
    // In a production environment, query your database for the stored image records
    // For example:
    //
    // const results = await db.webcamLogs.findMany({
    //   where: {
    //     userId: query.userId,
    //     examId: query.examId,
    //     ...(query.questionId ? { questionId: query.questionId } : {}),
    //     sessionId: query.sessionId
    //   },
    //   select: {
    //     imageUrl: true,
    //     timestamp: true
    //   },
    //   orderBy: {
    //     timestamp: 'asc'
    //   }
    // })

    // For this example, return a mock response
    return [
      { url: `https://example.com/mock-image-1.jpg`, timestamp: Date.now() - 5000 },
      { url: `https://example.com/mock-image-2.jpg`, timestamp: Date.now() - 4000 },
      { url: `https://example.com/mock-image-3.jpg`, timestamp: Date.now() - 3000 },
    ]
  } catch (error) {
    console.error("Error retrieving webcam images:", error)
    throw new Error("Failed to retrieve webcam images")
  }
}

/**
 * Generates a unique filename for storing the webcam image
 *
 * @param {WebcamImageData} data - Image data
 * @returns {string} Unique filename
 */
function generateUniqueImageFilename(data: WebcamImageData): string {
  // Create a hash from the input data to ensure uniqueness
  const hash = createHash("sha256")
    .update(`${data.userId}-${data.examId}-${data.questionId}-${data.sessionId}-${data.timestamp}`)
    .digest("hex")
    .substring(0, 12)

  // Format: webcam/userId/examId/questionId/timestamp-hash.jpg
  return `webcam/${data.userId}/${data.examId}/${data.questionId}/${data.timestamp}-${hash}.jpg`
}
