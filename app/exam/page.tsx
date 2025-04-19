"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Mic, Clock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMedia } from "@/context/media-context"

// Import the WebcamMonitor component near the top of the file
import { WebcamMonitor } from "@/components/webcam-monitor"

// Mock questions data by subject - expanded to 20 questions per subject
const questionsBySubject = {
  "software-engineering": Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `Software Engineering Question ${i + 1}: ${
      [
        "Which of the following is NOT a software development methodology?",
        "What does TDD stand for in software development?",
        "Which of the following is a key principle of object-oriented programming?",
        "What is the primary purpose of version control systems?",
        "Which of the following is NOT a software design pattern?",
        "What is the main goal of continuous integration?",
        "Which of the following is NOT a type of software testing?",
        "What does API stand for in software development?",
        "Which of the following is a characteristic of agile development?",
        "What is the purpose of a user story in agile development?",
        "Which of the following is NOT a phase in the traditional waterfall model?",
        "What is refactoring in software development?",
        "Which of the following is NOT a principle of SOLID design?",
        "What is the purpose of a software requirements specification?",
        "Which of the following is NOT a type of software maintenance?",
        "What is the primary goal of DevOps?",
        "Which of the following is NOT a benefit of code reviews?",
        "What is the purpose of a burndown chart in agile development?",
        "Which of the following is NOT a type of software architecture?",
        "What is the purpose of a use case in software engineering?",
      ][i % 20]
    }`,
    options: [
      { id: "a", text: `Option A for question ${i + 1}` },
      { id: "b", text: `Option B for question ${i + 1}` },
      { id: "c", text: `Option C for question ${i + 1}` },
      { id: "d", text: `Option D for question ${i + 1}` },
    ],
    difficulty: ["easy", "medium", "hard"][i % 3],
  })),
  "computer-architecture": Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `Computer Architecture Question ${i + 1}`,
    options: [
      { id: "a", text: `Option A for question ${i + 1}` },
      { id: "b", text: `Option B for question ${i + 1}` },
      { id: "c", text: `Option C for question ${i + 1}` },
      { id: "d", text: `Option D for question ${i + 1}` },
    ],
    difficulty: ["easy", "medium", "hard"][i % 3],
  })),
  python: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `Python Question ${i + 1}`,
    options: [
      { id: "a", text: `Option A for question ${i + 1}` },
      { id: "b", text: `Option B for question ${i + 1}` },
      { id: "c", text: `Option C for question ${i + 1}` },
      { id: "d", text: `Option D for question ${i + 1}` },
    ],
    difficulty: ["easy", "medium", "hard"][i % 3],
  })),
  dsa: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `DSA Question ${i + 1}`,
    options: [
      { id: "a", text: `Option A for question ${i + 1}` },
      { id: "b", text: `Option B for question ${i + 1}` },
      { id: "c", text: `Option C for question ${i + 1}` },
      { id: "d", text: `Option D for question ${i + 1}` },
    ],
    difficulty: ["easy", "medium", "hard"][i % 3],
  })),
  html: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `HTML Question ${i + 1}`,
    options: [
      { id: "a", text: `Option A for question ${i + 1}` },
      { id: "b", text: `Option B for question ${i + 1}` },
      { id: "c", text: `Option C for question ${i + 1}` },
      { id: "d", text: `Option D for question ${i + 1}` },
    ],
    difficulty: ["easy", "medium", "hard"][i % 3],
  })),
}

// Default to software engineering if no subject is specified
const defaultSubject = "software-engineering"

export default function ExamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get("subject") || defaultSubject

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [reviewedQuestions, setReviewedQuestions] = useState<number[]>([])
  const [lockedQuestions, setLockedQuestions] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState("40 minutes 0 seconds")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [questions, setQuestions] = useState(questionsBySubject[subject as keyof typeof questionsBySubject] || [])
  const [nextQuestionDifficulty, setNextQuestionDifficulty] = useState<string>("medium")
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const { startMediaStream, stopMediaStream } = useMedia()

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]

  // Initialize webcam and timer
  useEffect(() => {
    // Get user photo from localStorage
    const storedPhoto = localStorage.getItem("userPhoto")
    if (storedPhoto) {
      setUserPhoto(storedPhoto)
    }

    // Initialize webcam
    const initWebcam = async () => {
      try {
        const stream = await startMediaStream()

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Error accessing media devices:", err)
      }
    }

    // Check if media stream was active
    const mediaStreamActive = localStorage.getItem("mediaStreamActive") === "true"
    if (mediaStreamActive) {
      initWebcam()
    }

    // Timer countdown - 40 minutes
    const startTime = new Date().getTime()
    const examDuration = 40 * 60 * 1000 // 40 minutes in milliseconds

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const elapsed = now - startTime
      const remaining = examDuration - elapsed

      if (remaining <= 0) {
        clearInterval(timer)
        setTimeLeft("Time's up!")
        // In a real app, you would submit the exam automatically
        handleFinishExam()
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

        if (hours > 0) {
          setTimeLeft(`${hours} hour ${minutes} minutes ${seconds} seconds`)
        } else {
          setTimeLeft(`${minutes} minutes ${seconds} seconds`)
        }
      }
    }, 1000)

    // Add beforeunload event listener to prevent accidental navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      return ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup function - stop camera and mic when component unmounts
    return () => {
      clearInterval(timer)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      // The MediaContext will handle stopping the stream when navigating away
    }
  }, [])

  // Simulate AI analysis of camera feed to determine next question difficulty
  useEffect(() => {
    // This would be replaced with actual API call to analyze camera feed
    const analyzeUserBehavior = () => {
      // Simulate random difficulty selection based on "AI analysis"
      const difficulties = ["easy", "medium", "hard"]
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      setNextQuestionDifficulty(randomDifficulty)
    }

    // Run analysis every 10 seconds
    const analysisInterval = setInterval(analyzeUserBehavior, 10000)

    return () => clearInterval(analysisInterval)
  }, [])

  // Handle selecting an option for the current question
  const handleOptionSelect = (optionId: string) => {
    if (lockedQuestions.includes(currentQuestion.id)) {
      return // Cannot change answer for locked questions
    }

    setSelectedOptions({
      ...selectedOptions,
      [currentQuestion.id]: optionId,
    })
  }

  // Handle saving the current question and moving to the next
  const handleSaveAndContinue = () => {
    if (!selectedOptions[currentQuestion.id]) {
      alert("Please select an option before continuing.")
      return
    }

    // Mark question as answered and locked
    setAnsweredQuestions([...answeredQuestions, currentQuestion.id])
    setLockedQuestions([...lockedQuestions, currentQuestion.id])

    // In a real app, you would send the answer to the server here
    // For now, we'll just simulate moving to the next question

    // If this is the last question, show completion message
    if (currentQuestionIndex === questions.length - 1) {
      handleFinishExam()
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Handle marking a question for review
  const handleMarkForReview = () => {
    // Mark question as reviewed - no need for an answer to be selected
    if (!reviewedQuestions.includes(currentQuestion.id)) {
      setReviewedQuestions([...reviewedQuestions, currentQuestion.id])
    }

    // In a real app, you would send this information to the server
    // and potentially get a different type of question next

    // Move to next question if not the last one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleFinishExam()
    }
  }

  // Handle navigating to a specific question
  const handleQuestionNavigation = (index: number) => {
    // Only allow navigation to questions that have been seen
    if (index <= Math.max(currentQuestionIndex, 0)) {
      setCurrentQuestionIndex(index)
    }
  }

  // Handle moving to the next question without saving (for already answered questions)
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleFinishExam()
    }
  }

  // Handle finishing the exam
  const handleFinishExam = () => {
    // Calculate score
    const score = calculateScore()

    // Store score in localStorage for the results page (as fallback)
    localStorage.setItem("examScore", score.toString())
    localStorage.setItem("totalQuestions", questions.length.toString())
    localStorage.setItem("answeredQuestions", answeredQuestions.length.toString())
    localStorage.setItem("examSubject", subject)

    // Generate a session ID if we don't have one
    const sessionId = localStorage.getItem("examSessionId") || `session-${Date.now()}`
    localStorage.setItem("examSessionId", sessionId)

    // Stop media streams before navigating
    stopMediaStream()

    // Navigate to results page with query parameters
    router.push(`/results?sessionId=${sessionId}&subject=${subject}`)
  }

  // Calculate the score based on answered questions
  const calculateScore = () => {
    // In a real app, this would compare answers with correct answers
    // For now, we'll simulate a score based on the number of answered questions
    const answeredCount = answeredQuestions.length
    const correctAnswers = Math.floor(answeredCount * 0.7) // Simulate 70% correct answers
    return correctAnswers
  }

  // Get question status for the status panel
  const getQuestionStatus = () => {
    const totalQuestions = questions.length
    const visited = Math.min(currentQuestionIndex + 1, totalQuestions)
    const notVisited = totalQuestions - visited
    const reviewed = reviewedQuestions.length

    return { visited, notVisited, reviewed, totalQuestions }
  }

  // Handle exit confirmation
  const handleExitConfirm = () => {
    setShowExitConfirmation(false)
    handleFinishExam()
  }

  const handleExitCancel = () => {
    setShowExitConfirmation(false)
  }

  const handleExitExam = () => {
    setShowExitConfirmation(true)
  }

  const status = getQuestionStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">End Exam?</h3>
            <p className="mb-6">
              Are you sure you want to end the exam? Your answers will be submitted and you will see your results.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleExitCancel}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleExitConfirm}>
                End Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-screen">
        {/* Left Column - 15% width */}
        <div className="md:col-span-2 bg-blue-50 p-4 flex flex-col">
          <div className="flex flex-col items-center mb-6 pt-4">
            <Avatar className="h-16 w-16 mb-2">
              {userPhoto ? (
                <AvatarImage src={userPhoto || "/placeholder.svg"} alt="Student" />
              ) : (
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Student" />
              )}
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <h2 className="font-medium text-sm">John Doe</h2>
          </div>

          <h1 className="text-lg font-bold text-center mb-4">MOCK EXAM</h1>

          <div className="grid grid-cols-4 gap-1 mb-4">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                className={`h-8 w-8 p-0 text-xs ${
                  index === currentQuestionIndex
                    ? "bg-blue-600"
                    : lockedQuestions.includes(q.id)
                      ? "bg-red-100 border-red-300"
                      : reviewedQuestions.includes(q.id)
                        ? "bg-amber-100 border-amber-300"
                        : answeredQuestions.includes(q.id)
                          ? "bg-green-100 border-green-300"
                          : ""
                }`}
                onClick={() => handleQuestionNavigation(index)}
                disabled={index > currentQuestionIndex}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button variant="destructive" className="mt-auto" onClick={handleExitExam}>
            End Exam
          </Button>
        </div>

        {/* Middle Column - 60% width */}
        <div className="md:col-span-7 p-4 flex flex-col">
          {currentQuestion && (
            <>
              <Card className="flex-1 mb-4">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Question {currentQuestionIndex + 1}:</h3>
                      <p className="text-gray-700">{currentQuestion.text}</p>
                    </div>

                    <RadioGroup
                      value={selectedOptions[currentQuestion.id] || ""}
                      onValueChange={handleOptionSelect}
                      className="space-y-2"
                    >
                      {currentQuestion.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-2 p-3 rounded border ${
                            lockedQuestions.includes(currentQuestion.id)
                              ? "bg-gray-100 cursor-not-allowed"
                              : "hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={`option-${option.id}`}
                            disabled={lockedQuestions.includes(currentQuestion.id)}
                          />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className={`flex-1 ${
                              lockedQuestions.includes(currentQuestion.id) ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Warning message about not being able to change answers */}
                    <div className="text-sm text-gray-500 italic">
                      You can't change the answer after saving and moving to the next question.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {lockedQuestions.includes(currentQuestion.id) && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-sm">
                  This question has been answered and cannot be modified.
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleMarkForReview}
                >
                  Mark for Review & Next
                </Button>

                {lockedQuestions.includes(currentQuestion.id) ? (
                  // For already answered questions, show a simple Next button
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNextQuestion}>
                    {currentQuestionIndex === questions.length - 1 ? "Finish Exam" : "Next"}
                  </Button>
                ) : (
                  // For unanswered questions, show Save & Next button
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveAndContinue}
                    disabled={!selectedOptions[currentQuestion.id]}
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Finish Exam" : "Save & Next"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column - 25% width */}
        <div className="md:col-span-3 bg-gray-50 p-4 border-l">
          {/* Camera Preview */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="font-medium mb-3">Camera Preview</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
              <WebcamMonitor
                userId="user-123" // In a real app, use the actual user ID
                examId={subject}
                questionId={currentQuestion?.id.toString() || "1"}
                sessionId={`session-${Date.now()}`} // In a real app, use a persistent session ID
              />
            </div>
          </div>

          {/* Mic Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-green-600 font-medium">Mic is On</span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-blue-100 p-3 rounded-lg mb-6 flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">{timeLeft}</span>
          </div>

          {/* Question Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium mb-3">Question Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Visited</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {status.visited}/{status.totalQuestions}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Not Visited</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                  {status.notVisited}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Review</span>
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                  {status.reviewed}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
