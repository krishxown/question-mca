"use client"

import { useState, useEffect } from "react"
import { useCognitiveQuestions } from "@/hooks/use-cognitive-questions"
import { useCognitiveAnalysis } from "@/hooks/use-cognitive-analysis"
import { EyeTracker } from "@/components/eye-tracker"
import type { Question } from "@/types/questions"

/**
 * Example component showing how to integrate cognitive-based questions
 */
export default function CognitiveExamExample() {
  const [questionId, setQuestionId] = useState("1")
  const [sessionId] = useState(`session-${Date.now()}`)
  const [subject] = useState("software-engineering")
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  // Get cognitive state analysis
  const { cognitiveState } = useCognitiveAnalysis(questionId, sessionId)

  // Initialize the cognitive questions hook
  const { isLoading, question, error, cognitiveInsight, fetchQuestion } = useCognitiveQuestions({
    subject,
    onError: (err) => console.error("Cognitive question error:", err),
  })

  // Update local question when the hook returns a new one
  useEffect(() => {
    if (question) {
      setCurrentQuestion(question)
    }
  }, [question])

  // Get the first question when component mounts
  useEffect(() => {
    // Initial question fetch
    fetchQuestion(cognitiveState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle moving to the next question
  const handleNextQuestion = async () => {
    if (currentQuestion) {
      // Add current question to answered list
      setAnsweredQuestions((prev) => [...prev, currentQuestion.id])

      // Get a new question based on current cognitive state
      await fetchQuestion(cognitiveState, answeredQuestions)

      // Update question ID for eye tracking
      setQuestionId(String(Math.random())) // Generate a new random ID
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cognitive Adaptive Exam</h1>

      {/* Camera and eye tracking */}
      <div className="mb-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Camera Feed</h2>
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <EyeTracker questionId={questionId} />
        </div>
      </div>

      {/* Cognitive state display (debugging) */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Cognitive Analysis</h2>
        <ul className="space-y-1">
          <li>Attention: {Math.round(cognitiveState.attention * 100)}%</li>
          <li>Fatigue: {Math.round(cognitiveState.fatigue * 100)}%</li>
          <li>Confidence: {Math.round(cognitiveState.confidence * 100)}%</li>
          <li>Stress: {Math.round(cognitiveState.stress * 100)}%</li>
          <li>Engagement: {Math.round(cognitiveState.engagement * 100)}%</li>
        </ul>
      </div>

      {/* Question display */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        {isLoading ? (
          <div className="py-8 text-center">Loading question...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">Error: {error.message}</div>
        ) : currentQuestion ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Question {currentQuestion.id}</h2>
            <p className="text-gray-800 mb-6">{currentQuestion.text}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label key={option.id} className="flex items-start p-3 border rounded hover:bg-gray-50">
                  <input type="radio" name="answer" className="mt-1 mr-3" />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            {cognitiveInsight && (
              <div className="mt-6 p-3 bg-blue-50 rounded">
                <h3 className="font-semibold">Cognitive Insight:</h3>
                <p>{cognitiveInsight.recommendation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">No question available</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => {
            /* Mark for review */
          }}
        >
          Mark for Review
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleNextQuestion}
          disabled={isLoading || !currentQuestion}
        >
          {isLoading ? "Loading..." : "Next Question"}
        </button>
      </div>
    </div>
  )
}
