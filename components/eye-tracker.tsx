"use client"

import { useEffect, useRef } from "react"
import { useEyeTracking } from "@/hooks/use-eye-tracking"

interface EyeTrackerProps {
  questionId: string
  onQuestionChange?: (newQuestionId: string, previousQuestionId: string) => void
  debug?: boolean
}

export function EyeTracker({ questionId, onQuestionChange, debug = true }: EyeTrackerProps) {
  const prevQuestionIdRef = useRef(questionId)

  // Initialize the eye tracking hook
  const { state, videoRef, submitImagesForQuestion, startCapturing, stopCapturing } = useEyeTracking({
    questionId,
    autoStart: true,
    debug,
  })

  // When question changes, submit images from previous question
  useEffect(() => {
    if (prevQuestionIdRef.current !== questionId) {
      const previousQuestionId = prevQuestionIdRef.current

      // Submit the images for the previous question
      submitImagesForQuestion(previousQuestionId).then(() => {
        // If callback provided, notify parent of question change
        if (onQuestionChange) {
          onQuestionChange(questionId, previousQuestionId)
        }
      })

      // Update the ref to the current question
      prevQuestionIdRef.current = questionId
    }
  }, [questionId, submitImagesForQuestion, onQuestionChange])

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
    <div className="eye-tracker">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Optional status display for debugging */}
      {debug && (
        <div className="text-xs text-gray-500 mt-1">
          Status: {state.status} | Images: {state.imagesCount} | Last capture:{" "}
          {state.lastCaptureTime ? new Date(state.lastCaptureTime).toLocaleTimeString() : "N/A"}
        </div>
      )}
    </div>
  )
}
