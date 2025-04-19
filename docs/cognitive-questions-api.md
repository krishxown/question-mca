# Cognitive-Based Question Retrieval API

## Overview

The Cognitive-Based Question Retrieval API enables the EduVerify platform to deliver personalized questions based on a candidate's cognitive state. This API acts as a bridge between the frontend exam interface and the backend machine learning service that analyzes webcam data to determine cognitive states.

## Endpoint

\`\`\`
POST /api/cognitive-questions
\`\`\`

This endpoint retrieves a question tailored to the candidate's current cognitive state.

## Request Format

### Headers

\`\`\`
Content-Type: application/json
\`\`\`

### Body

\`\`\`json
{
  "cognitiveState": {
    "attention": 0.75,
    "fatigue": 0.25,
    "confidence": 0.65,
    "stress": 0.40,
    "engagement": 0.80,
    "questionId": "q_123",
    "sessionId": "session_456",
    "candidateId": "cand_789"
  },
  "subject": "software-engineering",
  "previousQuestionIds": [1, 2, 3],
  "difficultyPreference": "adaptive"
}
\`\`\`

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| cognitiveState | object | Object containing cognitive metrics |
| subject | string | The subject area for the question |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| previousQuestionIds | number[] | IDs of questions already presented to avoid duplicates |
| difficultyPreference | string | Preference for question difficulty selection ("adaptive", "fixed", "increasing") |

#### Cognitive State Metrics

| Metric | Type | Range | Description |
|--------|------|-------|-------------|
| attention | number | 0.0-1.0 | Level of visual attention detected |
| fatigue | number | 0.0-1.0 | Level of mental fatigue detected |
| confidence | number | 0.0-1.0 | Estimated confidence level |
| stress | number | 0.0-1.0 | Detected stress level |
| engagement | number | 0.0-1.0 | Overall engagement with the exam |

## Response Format

### Success Response (200 OK)

\`\`\`json
{
  "success": true,
  "question": {
    "id": 42,
    "text": "What is the primary purpose of the Observer design pattern?",
    "options": [
      { "id": "a", "text": "To define a family of algorithms" },
      { "id": "b", "text": "To notify objects about state changes" },
      { "id": "c", "text": "To ensure a class has only one instance" },
      { "id": "d", "text": "To separate construction from representation" }
    ],
    "difficulty": "medium",
    "cognitive_state": "focused",
    "subject": "software-engineering",
    "category": "design-patterns",
    "metadata": {
      "topic": "Observer Pattern",
      "subtopic": "Behavioral Patterns"
    }
  },
  "nextDifficulty": "hard",
  "cognitiveInsight": {
    "state": "focused",
    "recommendation": "Candidate is handling questions well. Consider increasing difficulty."
  }
}
\`\`\`

### Error Response (4xx/5xx)

\`\`\`json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "details": "Optional additional error details"
}
\`\`\`

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Question successfully retrieved |
| 400 | Bad request (missing required fields) |
| 404 | No suitable questions found |
| 502 | Backend API error |
| 503 | Service unavailable (backend unreachable) |
| 500 | Server error |

## Error Handling

The API implements several error handling mechanisms:

1. **Retry Logic**: Automatically retries failed backend requests up to 3 times with exponential backoff
2. **Validation**: Validates all incoming requests before processing
3. **Detailed Logging**: Logs detailed information for debugging
4. **Graceful Degradation**: Provides fallback options when optimal questions cannot be determined

## Usage Example

\`\`\`typescript
// Client-side example
import { useCognitiveQuestions } from "@/hooks/use-cognitive-questions";

function ExamComponent() {
  const { 
    isLoading, 
    question, 
    error, 
    cognitiveInsight,
    fetchQuestion 
  } = useCognitiveQuestions({
    subject: "software-engineering"
  });

  const handleGetNextQuestion = async () => {
    // Example cognitive state (in a real app, this would come from webcam analysis)
    const cognitiveState = {
      attention: 0.8,
      fatigue: 0.3,
      confidence: 0.7,
      stress: 0.4,
      engagement: 0.9,
      questionId: "current_question_id"
    };

    const previousIds = [1, 2, 3]; // Questions already shown
    
    await fetchQuestion(cognitiveState, previousIds);
  };

  return (
    <div>
      {isLoading && <p>Loading next question...</p>}
      {error && <p>Error: {error.message}</p>}
      {question && (
        <div>
          <h3>Question: {question.text}</h3>
          <ul>
            {question.options.map(option => (
              <li key={option.id}>{option.text}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleGetNextQuestion}>
        Get Next Question
      </button>
    </div>
  );
}
\`\`\`

## Integration with Cognitive Analysis

This API is designed to work in conjunction with the eye tracking and webcam monitoring features of the EduVerify platform:

1. Webcam images are captured during questions using the Eye Tracking API
2. These images are analyzed by backend ML models to determine cognitive state
3. The cognitive state is then used by this API to fetch appropriately challenging questions

For details on the webcam monitoring implementation, see the [Eye Tracking API documentation](/docs/eye-tracking-api.md).
\`\`\`

Let's create an example of how this might be integrated into your exam page:
