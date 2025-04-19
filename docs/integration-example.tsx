"use client"

// Example of how to integrate the eye tracking in the exam page

// In your exam page component:
import { EyeTracker } from "@/components/eye-tracker"
import { useState } from "react"

// Inside your component:
const [currentQuestionId, setCurrentQuestionId] = useState("1")

// When saving and moving to next question:
const handleSaveAndContinue = () => {
  // Save the answer
  // ...
  const nextQuestionId = "2" // example next question id

  // Move to next question
  setCurrentQuestionId(nextQuestionId)
}

// In your JSX:
;<div className="camera-preview">
  <EyeTracker
    questionId={currentQuestionId}
    onQuestionChange={(newId, prevId) => {
      console.log(`Submitted eye tracking data for question ${prevId}`)
    }}
  />
</div>
