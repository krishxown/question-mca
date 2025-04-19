"use client"

import { useState } from "react"

interface ExamScoreParams {
  examId?: string
  userId?: string
  sessionId?: string
  subject?: string
}

interface ScoreDetails {
  score: number
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  skippedQuestions: number
  timeSpent: number // in seconds
  grade: string
  percentageScore: number
  feedback?: string
  subjectAnalysis?: Record<string, number> // scores by topic/category
}

interface ExamScoreState {
  isLoading: boolean
  error: Error | null
  scoreDetails: ScoreDetails | null
}

/**
 * Hook to fetch and manage exam score data
 */
export function useExamScore() {
  const [state, setState] = useState<ExamScoreState>({
    isLoading: false,
    error: null,
    scoreDetails: null,
  })

  /**
   * Fetches the exam score from the backend
   */
  const fetchScore = async (params: ExamScoreParams) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Build the URL with query parameters
      const url = new URL("/api/exam-score", window.location.origin)
      if (params.examId) url.searchParams.append("examId", params.examId)
      if (params.userId) url.searchParams.append("userId", params.userId)
      if (params.sessionId) url.searchParams.append("sessionId", params.sessionId)
      if (params.subject) url.searchParams.append("subject", params.subject)

      // Fetch the score data
      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch exam score")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Invalid score data")
      }

      setState({
        isLoading: false,
        error: null,
        scoreDetails: data.scoreDetails,
      })

      return data.scoreDetails
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Unknown error")

      console.error("Error fetching exam score:", errorObj)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }))

      return null
    }
  }

  return {
    ...state,
    fetchScore,
  }
}
