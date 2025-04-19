"use client"

import { useEffect, useRef } from "react"
import { useWebcamMonitoring } from "@/hooks/use-webcam-monitoring"

interface WebcamMonitorProps {
  userId: string
  examId: string
  questionId: string
  sessionId: string
  onQuestionChange?: (newQuestionId: string) => void
}

export function WebcamMonitor({ userId, examId, questionId, sessionId, onQuestionChange }: WebcamMonitorProps) {
  const prevQuestionIdRef = useRef(questionId)

  // Initialize the webcam monitoring hook
  const { state, videoRef, uploadImages, startCapturing, stopCapturing } = useWebcamMonitoring({
    userId,
    examId,
    questionId,
    sessionId,
    autoStart: true,
  })

  // When question changes, upload images from previous question
  useEffect(() => {
    if (prevQuestionIdRef.current !== questionId) {
      // Add logging before uploading
      console.log("Question changed, uploading webcam images:", {
        previousQuestionId: prevQuestionIdRef.current,
        newQuestionId: questionId,
        imagesQueued: state.imagesQueued,
        timestamp: new Date().toISOString(),
      })

      // Upload the images for the previous question
      uploadImages().then(() => {
        // If callback provided, notify parent of question change
        if (onQuestionChange) {
          onQuestionChange(questionId)
        }
      })

      // Update the ref to the current question
      prevQuestionIdRef.current = questionId
    }
  }, [questionId, uploadImages, onQuestionChange, state.imagesQueued])

  // Handle window visibility changes to pause/resume capturing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCapturing()
      } else {
        startCapturing()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [startCapturing, stopCapturing])

  return (
    <div className="webcam-monitor">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Optional status display for debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mt-1">
          Status: {state.status} | Images: {state.imagesQueued} | Last capture:{" "}
          {state.lastCaptureTime ? new Date(state.lastCaptureTime).toLocaleTimeString() : "N/A"}
        </div>
      )}
    </div>
  )
}
