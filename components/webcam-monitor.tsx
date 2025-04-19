"use client"

import { useEffect, useRef } from "react"
import { EyeTracker } from "@/components/eye-tracker"

interface WebcamMonitorProps {
  userId: string
  examId: string
  questionId: string
  sessionId: string
  onQuestionChange?: (newQuestionId: string) => void
}

export function WebcamMonitor({ userId, examId, questionId, sessionId, onQuestionChange }: WebcamMonitorProps) {
  const prevQuestionIdRef = useRef(questionId)

  // When question changes, handle the change
  useEffect(() => {
    if (prevQuestionIdRef.current !== questionId) {
      // If callback provided, notify parent of question change
      if (onQuestionChange) {
        onQuestionChange(questionId)
      }

      // Update the ref to the current question
      prevQuestionIdRef.current = questionId
    }
  }, [questionId, onQuestionChange])

  return (
    <div className="webcam-monitor">
      {/* Use our EyeTracker component */}
      <EyeTracker
        questionId={questionId}
        onQuestionChange={(newId, prevId) => {
          console.log(`Question changed from ${prevId} to ${newId}`)
          if (onQuestionChange) {
            onQuestionChange(newId)
          }
        }}
        debug={process.env.NODE_ENV === "development"} // Only show debug info in development
      />
    </div>
  )
}
