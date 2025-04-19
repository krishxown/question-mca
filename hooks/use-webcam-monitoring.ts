"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface WebcamMonitoringOptions {
  userId: string
  examId: string
  questionId: string
  sessionId: string
  captureInterval?: number // in milliseconds, defaults to 1000ms (1 second)
  maxImageCount?: number // maximum number of images to capture before recycling
  autoStart?: boolean // whether to start capturing automatically
}

interface WebcamMonitoringState {
  isCapturing: boolean
  status: "idle" | "capturing" | "uploading" | "error"
  imagesQueued: number
  lastCaptureTime: number | null
  error: Error | null
}

/**
 * Hook for monitoring a user via webcam during an exam
 * Captures images at regular intervals and submits them to the server
 */
export function useWebcamMonitoring({
  userId,
  examId,
  questionId,
  sessionId,
  captureInterval = 1000,
  maxImageCount = 30,
  autoStart = false,
}: WebcamMonitoringOptions) {
  // State for the hook
  const [state, setState] = useState<WebcamMonitoringState>({
    isCapturing: false,
    status: "idle",
    imagesQueued: 0,
    lastCaptureTime: null,
    error: null,
  })

  // References for internal tracking
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageQueueRef = useRef<Array<{ data: Blob; timestamp: number }>>([])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

          // Add to queue with timestamp
          const timestamp = Date.now()
          imageQueueRef.current.push({ data: blob, timestamp })

          // If we have more than maxImageCount, remove the oldest
          if (imageQueueRef.current.length > maxImageCount) {
            imageQueueRef.current.shift()
          }

          // Update state
          setState((prev) => ({
            ...prev,
            imagesQueued: imageQueueRef.current.length,
            lastCaptureTime: timestamp,
          }))
        },
        "image/jpeg",
        0.85,
      ) // Use JPEG with 85% quality for smaller file size
    } catch (error) {
      console.error("Error capturing image:", error)
    }
  }, [maxImageCount])

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
  }, [captureImage, captureInterval])

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
  }, [])

  // Upload the images to the server
  const uploadImages = useCallback(async () => {
    // If no images or already uploading, return
    if (imageQueueRef.current.length === 0 || state.status === "uploading") {
      return
    }

    try {
      setState((prev) => ({
        ...prev,
        status: "uploading",
      }))

      // Take a copy of the current queue
      const images = [...imageQueueRef.current]

      // Clear the queue
      imageQueueRef.current = []

      // Process each image
      const results = await Promise.allSettled(
        images.map(async ({ data, timestamp }) => {
          const formData = new FormData()
          formData.append("userId", userId)
          formData.append("examId", examId)
          formData.append("questionId", questionId)
          formData.append("sessionId", sessionId)
          formData.append("timestamp", timestamp.toString())
          formData.append("image", data, `image-${timestamp}.jpg`)

          // Add console logging here, before sending to backend
          console.log("Uploading webcam image:", {
            timestamp: new Date(timestamp).toISOString(),
            questionId,
            imageSize: `${Math.round(data.size / 1024)} KB`,
            imageType: data.type,
          })

          // For debugging, you can also log a preview URL
          const imageUrl = URL.createObjectURL(data)
          console.log("Image preview URL (for development only):", imageUrl)

          const response = await fetch("/api/webcam-monitoring", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to upload image")
          }

          return await response.json()
        }),
      )

      // Check for any failures
      const failures = results.filter((r) => r.status === "rejected")
      if (failures.length > 0) {
        console.warn(`${failures.length} images failed to upload`)
      }

      setState((prev) => ({
        ...prev,
        status: prev.isCapturing ? "capturing" : "idle",
        imagesQueued: imageQueueRef.current.length,
      }))

      return true
    } catch (error) {
      console.error("Error uploading images:", error)
      setState((prev) => ({
        ...prev,
        status: prev.isCapturing ? "capturing" : "idle",
        error: error instanceof Error ? error : new Error("Failed to upload images"),
      }))
      return false
    }
  }, [userId, examId, questionId, sessionId, state.status])

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
      imagesQueued: 0,
      lastCaptureTime: null,
      error: null,
    })

    // Clear references
    videoRef.current = null
  }, [])

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
    uploadImages,
    cleanup,
  }
}
