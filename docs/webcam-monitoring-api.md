# Webcam Monitoring API Documentation

## Overview

The Webcam Monitoring API enables secure capture, transmission, and storage of webcam images during online assessments. This API is designed to capture images at regular intervals while a user is working on a question, and then submit those images when the user moves to the next question or completes the exam.

## API Endpoints

### POST /api/webcam-monitoring

Uploads a single webcam image for monitoring purposes.

#### Request

- **Content-Type:** `multipart/form-data`

#### Form Fields

| Field       | Type     | Required | Description                                     |
|-------------|----------|----------|-------------------------------------------------|
| userId      | string   | Yes      | Unique identifier for the user                  |
| examId      | string   | Yes      | Identifier for the exam                         |
| questionId  | string   | Yes      | Identifier for the current question             |
| sessionId   | string   | Yes      | Unique identifier for the exam session          |
| timestamp   | number   | No       | Timestamp when the image was captured (ms)      |
| image       | File     | Yes      | The webcam image file (JPEG or PNG)             |

#### Response

**Success (200 OK)**

\`\`\`json
{
  "success": true,
  "imageUrl": "https://example.com/path/to/stored/image.jpg",
  "message": "Image captured and stored successfully"
}
\`\`\`

**Error (4xx/5xx)**

\`\`\`json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
\`\`\`

#### Status Codes

| Status Code | Description                                                 |
|-------------|-------------------------------------------------------------|
| 200         | Image successfully uploaded and processed                   |
| 400         | Bad request (missing fields, invalid data, etc.)            |
| 401         | Unauthorized (invalid or missing authentication)            |
| 413         | Payload too large (image file size exceeds limits)          |
| 500         | Server error                                                |

### GET /api/webcam-monitoring

Retrieves webcam images for a specific exam session or question.

#### Query Parameters

| Parameter   | Type     | Required | Description                                     |
|-------------|----------|----------|-------------------------------------------------|
| userId      | string   | Yes      | Unique identifier for the user                  |
| examId      | string   | Yes      | Identifier for the exam                         |
| sessionId   | string   | Yes      | Unique identifier for the exam session          |
| questionId  | string   | No       | Identifier for a specific question (optional)   |

#### Response

**Success (200 OK)**

\`\`\`json
{
  "success": true,
  "images": [
    {
      "url": "https://example.com/path/to/image1.jpg",
      "timestamp": 1619712345678
    },
    {
      "url": "https://example.com/path/to/image2.jpg",
      "timestamp": 1619712346789
    }
  ]
}
\`\`\`

**Error (4xx/5xx)**

\`\`\`json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
\`\`\`

## Client Implementation

The API includes a React hook `useWebcamMonitoring` that simplifies client-side implementation:

\`\`\`tsx
import { useWebcamMonitoring } from '@/hooks/use-webcam-monitoring'

function ExamQuestion() {
  const {
    state,
    videoRef,
    uploadImages,
    startCapturing,
    stopCapturing
  } = useWebcamMonitoring({
    userId: 'user-123',
    examId: 'exam-456',
    questionId: 'question-789',
    sessionId: 'session-101112',
    autoStart: true
  })
  
  // Attach videoRef to your video element
  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      {/* Question content */}
    </div>
  )
}
\`\`\`

## Security Considerations

1. **Authentication**: All API requests must include proper authentication
2. **Data Privacy**: Images are stored securely with access controls
3. **Consent**: Users must provide consent for webcam monitoring
4. **Data Retention**: Images are retained only for the necessary duration
5. **Encryption**: All data transmission uses HTTPS

## Rate Limiting

To prevent abuse, the API implements rate limiting:

- Maximum 60 requests per minute per user
- Maximum image size: 1MB
- Maximum 30 concurrent uploads per user

## Error Handling

The API provides detailed error messages to help debug issues. Common errors include:

- Missing required fields
- Invalid image format
- Unauthorized access
- Server-side processing errors

For all errors, check the `error` field in the response for details.
