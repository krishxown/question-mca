# Exam Score API Documentation

## Overview

The Exam Score API enables the EduVerify platform to retrieve detailed exam results from the backend scoring service. This API provides a standardized way to fetch score data for display on the results page.

## Endpoint

\`\`\`
GET /api/exam-score
\`\`\`

This endpoint retrieves score details for a completed exam.

## Request Format

### Query Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| examId    | string | No*      | Unique identifier for the exam                  |
| userId    | string | No       | Identifier for the user who took the exam       |
| sessionId | string | No*      | Unique identifier for the exam session          |
| subject   | string | No       | Subject of the exam                             |

*Either examId or sessionId must be provided

## Response Format

### Success Response (200 OK)

\`\`\`json
{
  "success": true,
  "scoreDetails": {
    "score": 15,
    "totalQuestions": 20,
    "answeredQuestions": 18,
    "correctAnswers": 15,
    "incorrectAnswers": 3,
    "skippedQuestions": 2,
    "timeSpent": 1800,
    "grade": "B",
    "percentageScore": 75,
    "feedback": "Great job! You've demonstrated a solid understanding of the subject.",
    "subjectAnalysis": {
      "algorithms": 80,
      "dataStructures": 70,
      "programming": 75
    }
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

| Status Code | Description                                                 |
|-------------|-------------------------------------------------------------|
| 200         | Score successfully retrieved                                |
| 400         | Bad request (missing required parameters)                   |
| 404         | No score found for the given parameters                     |
| 502         | Backend API error                                           |
| 503         | Service unavailable (backend unreachable)                   |
| 500         | Server error                                                |

## Error Handling

The API implements several error handling mechanisms:

1. **Retry Logic**: Automatically retries failed backend requests up to 3 times with exponential backoff
2. **Validation**: Validates all incoming requests before processing
3. **Detailed Logging**: Logs detailed information for debugging
4. **Graceful Degradation**: Falls back to localStorage data if API fails

## Usage Example

\`\`\`typescript
// Client-side example
import { useExamScore } from "@/hooks/use-exam-score";

function ResultsComponent() {
  const { 
    isLoading, 
    error, 
    scoreDetails,
    fetchScore 
  } = useExamScore();

  useEffect(() => {
    // Fetch score when component mounts
    fetchScore({
      sessionId: "session-123456",
      subject: "software-engineering"
    });
  }, [fetchScore]);

  if (isLoading) {
    return <div>Loading score...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!scoreDetails) {
    return <div>No score data available</div>;
  }

  return (
    <div>
      <h1>Your Exam Results</h1>
      <p>Score: {scoreDetails.score}/{scoreDetails.totalQuestions}</p>
      <p>Percentage: {scoreDetails.percentageScore}%</p>
      <p>Grade: {scoreDetails.grade}</p>
      {/* Display other score details */}
    </div>
  );
}
\`\`\`

## Integration with Exam System

This API is designed to work seamlessly with the EduVerify exam system:

1. When a candidate completes an exam, the exam page redirects to the results page with the sessionId
2. The results page uses this sessionId to fetch the detailed score from the backend
3. If the API call fails, the system falls back to using localStorage data

For details on the exam submission process, see the [Exam API documentation](/docs/exam-api.md).
