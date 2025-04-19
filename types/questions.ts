export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: number
  text: string
  options: QuestionOption[]
  difficulty: string
  cognitive_state?: string
  subject?: string
  category?: string
  metadata?: Record<string, any>
}

export interface CognitiveState {
  attention: number
  fatigue: number
  confidence: number
  stress: number
  engagement: number
  questionId?: string
  sessionId?: string
  candidateId?: string
}

export interface QuestionRequestParams {
  cognitiveState: CognitiveState
  subject: string
  previousQuestionIds?: number[]
  difficultyPreference?: string
}

export interface QuestionResponse {
  success: boolean
  question?: Question
  message?: string
  nextDifficulty?: string
  cognitiveInsight?: {
    state: string
    recommendation: string
  }
}
