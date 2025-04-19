# Eye Tracking API Documentation

## Overview

The Eye Tracking API enables capturing and transmitting webcam images during exam questions. The system captures images at one-second intervals while a candidate is engaged with a question, and submits these images when the candidate clicks "Save & Next" to move to the next question.

## Client-Side Implementation

### `useEyeTracking` Hook

A React hook that handles webcam access, image capture, and submission.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| questionId | string | required | Identifier for the current question |
| captureInterval | number | 1000 | Interval between captures in milliseconds |
| maxImageCount | number | 60 | Maximum number of images to store in memory |
| autoStart | boolean | false | Whether to start capturing automatically |
| debug | boolean | true | Whether to enable debug logging |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| state | object | Current state of the eye tracking |
| videoRef | function | Ref callback to attach to a video element |
| setupWebcam | function | Initialize webcam access |
| startCapturing | function | Start capturing images |
| stopCapturing | function | Stop capturing images |
| submitImagesForQuestion | function | Submit images for a specific question |
| cleanup | function | Release all resources |

### `EyeTracker` Component

A React component that uses the `useEyeTracking` hook to provide a ready-to-use eye tracking solution.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| questionId | string | required | Identifier for the current question |
| onQuestionChange | function | undefined | Callback when question changes |
| debug | boolean | true | Whether to enable debug display |

## API Endpoint

### POST /api/eye-tracking

Handles webcam image uploads and forwards them to the backend API.

#### Request

- **Content-Type:** `multipart/form-data`

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionId | string | Yes | Identifier for the question |
| images | File[] | Yes | Array of image files |
| timestamps | string[] | No | Array of timestamps for each image |

#### Response

**Success (200 OK)**

\`\`\`json
{
  "success": true,
  "message": "Successfully processed X eye tracking images for question Y",
  "backendResponse": { /* Response from backend API */ }
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

| Status Code | Description |
|-------------|-------------|
| 200 | Images successfully processed |
| 400 | Bad request (missing fields, invalid data) |
| 502 | Backend API error |
| 503 | Service unavailable (backend unreachable) |
| 500 | Server error |

## Backend API Integration

The API forwards captured images to a backend endpoint at:
`http://127.0.0.1:8000/api/quiz/submit-eye-data`

### Request Format

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** Same form fields as received by the Next.js API

## Error Handling

The API implements several error handling mechanisms:

1. **Retry Logic**: Automatically retries failed backend requests up to 3 times with exponential backoff
2. **Validation**: Validates all incoming requests before processing
3. **Detailed Logging**: Logs detailed information for debugging
4. **Graceful Degradation**: Continues exam functionality even if eye tracking fails

## Network Resilience

To handle network interruptions:

1. Images are stored in memory until successfully submitted
2. Automatic retries with exponential backoff
3. Batch submissions to reduce network overhead
4. Separate submission logic from capture logic

## Security Considerations

1. Images are transmitted directly to your backend without persistent storage in the Next.js app
2. No third-party services are used for image processing
3. Images are only captured when the candidate is actively engaged with a question
4. The webcam is automatically paused when the browser tab is not visible

## Debugging

When `debug` is set to `true`:
- Console logs show detailed information about captured images
- Preview URLs are generated for development environments
- The component displays current status information
\`\`\`

Now, let's update the WebcamMonitor component to use our new eye tracking implementation:
