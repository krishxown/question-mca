"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface EyeTrackingOptions {
  questionId: string
  captureInterval?: number // in milliseconds, defaults to 1000ms (1 second)
  maxImageCount?: number // maximum number of images to store in memory
  autoStart?: boolean // whether to start capturing automatically
  debug?: boolean // whether to enable debug logging
}

interface EyeTrackingState {
  isCapturing: boolean
  status: "idle" | "capturing" | "uploading" | "error"
  imagesCount: number
  lastCaptureTime: number | null
  error: Error | null
}

/**
 * Hook for capturing webcam images during exam questions
 */
export function useEyeTracking({
  questionId,
  captureInterval = 1000,
  maxImageCount = 60, // Store up to 60 images (1 minute worth at 1 per second)
  autoStart = false,
  debug = true, // Enable debug by default
}: EyeTrackingOptions) {
  // State for the hook
  const [state, setState] = useState<EyeTrackingState>({
    isCapturing: false,
    status: "idle",
    imagesCount: 0,
    lastCaptureTime: null,
    error: null,
  })

  // References for internal tracking
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageQueueRef = useRef<Array<{ data: Blob; timestamp: number; questionId: string }>>([])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const currentQuestionIdRef = useRef<string>(questionId)

  // Update the current question ID when it changes
  useEffect(() => {
    currentQuestionIdRef.current = questionId
  }, [questionId])

  // Setup the webcam stream
  const setupWebcam = useCallback(async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      // Store the stream reference
      streamRef.current = stream

      // If there's a video element reference, attach the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Create a canvas for capturing if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement("canvas")
        canvas.width = 640
        canvas.height = 480
        canvasRef.current = canvas
      }

      // Start capturing if autoStart is true
      if (autoStart) {
        startCapturing()
      }

      return true
    } catch (error) {
      console.error("Error setting up webcam:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to access webcam"),
      }))
      return false
    }
  }, [autoStart])

  // Function to capture an image from the webcam
  const captureImage = useCallback(() => {
    if (!streamRef.current || !canvasRef.current || !videoRef.current) {
      return
    }

    try {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      const video = videoRef.current

      if (!context) return

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert the canvas to a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return

          // Add to queue with timestamp and current question ID
          const timestamp = Date.now()
          const currentQuestionId = currentQuestionIdRef.current
          imageQueueRef.current.push({
            data: blob,
            timestamp,
            questionId: currentQuestionId,
          })

          // If we have more than maxImageCount, remove the oldest
          if (imageQueueRef.current.length > maxImageCount) {
            imageQueueRef.current.shift()
          }

          // Debug logging if enabled
          if (debug) {
            console.log(`Captured eye tracking image for question ${currentQuestionId}:`, {
              timestamp: new Date(timestamp).toISOString(),
              size: `${Math.round(blob.size / 1024)} KB`,
              type: blob.type,
              totalImages: imageQueueRef.current.length,
            })
          }

          // Update state
          setState((prev) => ({
            ...prev,
            imagesCount: imageQueueRef.current.length,
            lastCaptureTime: timestamp,
          }))
        },
        "image/jpeg",
        0.85,
      ) // Use JPEG with 85% quality for smaller file size
    } catch (error) {
      console.error("Error capturing image:", error)
    }
  }, [debug])

  // Start capturing images
  const startCapturing = useCallback(() => {
    if (captureIntervalRef.current) {
      return // Already capturing
    }

    // Start the interval for capturing
    captureIntervalRef.current = setInterval(captureImage, captureInterval)

    setState((prev) => ({
      ...prev,
      isCapturing: true,
      status: "capturing",
    }))

    if (debug) {
      console.log("Started eye tracking for question:", currentQuestionIdRef.current)
    }
  }, [captureImage, captureInterval, debug])

  // Stop capturing images
  const stopCapturing = useCallback(() => {
    // Clear the capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    setState((prev) => ({
      ...prev,
      isCapturing: false,
      status: "idle",
    }))

    if (debug) {
      console.log("Stopped eye tracking")
    }
  }, [debug])

  // Submit images for a specific question
  const submitImagesForQuestion = useCallback(
    async (targetQuestionId: string) => {
      // Filter images for the target question
      const images = imageQueueRef.current.filter((img) => img.questionId === targetQuestionId)

      if (images.length === 0) {
        if (debug) {
          console.log(`No images to submit for question ${targetQuestionId}`)
        }
        return { success: true, message: "No images to submit" }
      }

      try {
        setState((prev) => ({ ...prev, status: "uploading" }))

        if (debug) {
          console.log(`Submitting ${images.length} eye tracking images for question ${targetQuestionId}`)
        }

        // Create a FormData object to send the images
        const formData = new FormData()
        formData.append("questionId", targetQuestionId)

        // Add each image to the FormData
        images.forEach((img, index) => {
          // Log image data to console for debugging
          console.log(`Eye tracking image ${index + 1} for question ${targetQuestionId}:`, {
            timestamp: new Date(img.timestamp).toISOString(),
            size: `${Math.round(img.data.size / 1024)} KB`,
            type: img.data.type,
          })

          // Create a preview URL for debugging (only in development)
          if (process.env.NODE_ENV === "development") {
            const imageUrl = URL.createObjectURL(img.data)
            console.log(`Image ${index + 1} preview URL:`, imageUrl)
          }

          // Append the image to the FormData
          formData.append(`images`, img.data, `image-${img.timestamp}.jpg`)
          formData.append(`timestamps`, img.timestamp.toString())
        })

        // Send the images to our Next.js API endpoint
        const response = await fetch("/api/eye-tracking", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to submit images")
        }

        const result = await response.json()

        // Remove the submitted images from the queue
        imageQueueRef.current = imageQueueRef.current.filter((img) => img.questionId !== targetQuestionId)

        setState((prev) => ({
          ...prev,
          status: prev.isCapturing ? "capturing" : "idle",
          imagesCount: imageQueueRef.current.length,
        }))

        if (debug) {
          console.log(`Successfully submitted eye tracking images for question ${targetQuestionId}`, result)
        }

        return result
      } catch (error) {
        console.error(`Error submitting eye tracking images for question ${targetQuestionId}:`, error)

        setState((prev) => ({
          ...prev,
          status: prev.isCapturing ? "capturing" : "idle",
          error: error instanceof Error ? error : new Error("Failed to submit images"),
        }))

        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
    [debug],
  )

  // Function to attach to a video element
  const attachToVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element

    // If we have a stream and a new video element, attach the stream
    if (element && streamRef.current) {
      element.srcObject = streamRef.current
    }
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop the interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Reset state
    setState({
      isCapturing: false,
      status: "idle",
      imagesCount: 0,
      lastCaptureTime: null,
      error: null,
    })

    // Clear references
    videoRef.current = null
    imageQueueRef.current = []

    if (debug) {
      console.log("Eye tracking resources cleaned up")
    }
  }, [debug])

  // Clean up when the component unmounts
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Auto-setup if needed
  useEffect(() => {
    if (autoStart) {
      setupWebcam()
    }
  }, [autoStart, setupWebcam])

  // Return the hook interface
  return {
    state,
    videoRef: attachToVideo,
    setupWebcam,
    startCapturing,
    stopCapturing,
    submitImagesForQuestion,
    cleanup,
  }
}
