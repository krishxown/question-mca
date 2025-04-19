"use client"

import { useState } from "react"
import type { CognitiveState, Question, QuestionResponse } from "@/types/questions"

interface CognitiveQuestionsHookOptions {
  subject: string
  onError?: (error: Error) => void
}

interface CognitiveQuestionsState {
  isLoading: boolean
  question: Question | null
  error: Error | null
  cognitiveInsight: {
    state: string
    recommendation: string
  } | null
}

export function useCognitiveQuestions({ subject, onError }: CognitiveQuestionsHookOptions) {
  const [state, setState] = useState<CognitiveQuestionsState>({
    isLoading: false,
    question: null,
    error: null,
    cognitiveInsight: null,
  })

  /**
   * Fetches a question based on cognitive state
   */
  const fetchQuestion = async (cognitiveState: CognitiveState, previousQuestionIds?: number[]) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch("/api/cognitive-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cognitiveState,
          subject,
          previousQuestionIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch question")
      }

      const data: QuestionResponse = await response.json()

      if (!data.success || !data.question) {
        throw new Error(data.message || "Invalid question data")
      }

      setState({
        isLoading: false,
        question: data.question,
        error: null,
        cognitiveInsight: data.cognitiveInsight || null,
      })

      return data.question
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Unknown error")

      console.error("Error fetching cognitive question:", errorObj)

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }))

      if (onError) {
        onError(errorObj)
      }

      return null
    }
  }

  return {
    ...state,
    fetchQuestion,
  }
}
