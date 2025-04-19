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

// Mock questions data by subject
const questionsBySubject = {
  "software-engineering": [
    {
      id: 1,
      text: "Which of the following is NOT a software development methodology?",
      options: [
        { id: "a", text: "Agile" },
        { id: "b", text: "Waterfall" },
        { id: "c", text: "Quantum Programming" },
        { id: "d", text: "Scrum" },
      ],
      difficulty: "easy",
    },
    {
      id: 2,
      text: "What does TDD stand for in software development?",
      options: [
        { id: "a", text: "Test-Driven Development" },
        { id: "b", text: "Time-Driven Design" },
        { id: "c", text: "Technical Design Document" },
        { id: "d", text: "Total Development Duration" },
      ],
      difficulty: "medium",
    },
    {
      id: 3,
      text: "Which of the following is a key principle of object-oriented programming?",
      options: [
        { id: "a", text: "Encapsulation" },
        { id: "b", text: "Fragmentation" },
        { id: "c", text: "Centralization" },
        { id: "d", text: "Duplication" },
      ],
      difficulty: "easy",
    },
  ],
  "computer-architecture": [
    {
      id: 1,
      text: "What is the primary function of the ALU in a CPU?",
      options: [
        { id: "a", text: "Memory management" },
        { id: "b", text: "Performing arithmetic and logical operations" },
        { id: "c", text: "Input/Output control" },
        { id: "d", text: "Disk storage" },
      ],
      difficulty: "medium",
    },
    {
      id: 2,
      text: "Which of the following is a volatile memory?",
      options: [
        { id: "a", text: "ROM" },
        { id: "b", text: "Hard Disk" },
        { id: "c", text: "RAM" },
        { id: "d", text: "Flash Drive" },
      ],
      difficulty: "easy",
    },
    {
      id: 3,
      text: "What does RISC stand for in computer architecture?",
      options: [
        { id: "a", text: "Reduced Instruction Set Computer" },
        { id: "b", text: "Random Instruction Set Computing" },
        { id: "c", text: "Rapid Integrated System Circuit" },
        { id: "d", text: "Runtime Instruction Sequence Control" },
      ],
      difficulty: "hard",
    },
  ],
  python: [
    {
      id: 1,
      text: "Which of the following is the correct way to create a list in Python?",
      options: [
        { id: "a", text: "list = [1, 2, 3]" },
        { id: "b", text: "list = (1, 2, 3)" },
        { id: "c", text: "list = {1, 2, 3}" },
        { id: "d", text: "list = 1, 2, 3" },
      ],
      difficulty: "easy",
    },
    {
      id: 2,
      text: "What is the output of the following code: print(3 * '7')?",
      options: [
        { id: "a", text: "21" },
        { id: "b", text: "777" },
        { id: "c", text: "7 7 7" },
        { id: "d", text: "Error" },
      ],
      difficulty: "medium",
    },
    {
      id: 3,
      text: "Which of the following is used for handling exceptions in Python?",
      options: [
        { id: "a", text: "try-except" },
        { id: "b", text: "try-catch" },
        { id: "c", text: "if-else" },
        { id: "d", text: "for-in" },
      ],
      difficulty: "medium",
    },
  ],
  dsa: [
    {
      id: 1,
      text: "What is the time complexity of binary search?",
      options: [
        { id: "a", text: "O(1)" },
        { id: "b", text: "O(n)" },
        { id: "c", text: "O(log n)" },
        { id: "d", text: "O(n²)" },
      ],
      difficulty: "medium",
    },
    {
      id: 2,
      text: "Which data structure operates on a LIFO principle?",
      options: [
        { id: "a", text: "Queue" },
        { id: "b", text: "Stack" },
        { id: "c", text: "Linked List" },
        { id: "d", text: "Tree" },
      ],
      difficulty: "easy",
    },
    {
      id: 3,
      text: "What is the worst-case time complexity of quicksort?",
      options: [
        { id: "a", text: "O(n)" },
        { id: "b", text: "O(n log n)" },
        { id: "c", text: "O(n²)" },
        { id: "d", text: "O(1)" },
      ],
      difficulty: "hard",
    },
  ],
  html: [
    {
      id: 1,
      text: "Which HTML tag is used to create a hyperlink?",
      options: [
        { id: "a", text: "<a>" },
        { id: "b", text: "<link>" },
        { id: "c", text: "<href>" },
        { id: "d", text: "<url>" },
      ],
      difficulty: "easy",
    },
    {
      id: 2,
      text: "Which attribute is used to specify an alternate text for an image?",
      options: [
        { id: "a", text: "title" },
        { id: "b", text: "alt" },
        { id: "c", text: "src" },
        { id: "d", text: "description" },
      ],
      difficulty: "easy",
    },
    {
      id: 3,
      text: "Which HTML element is used to specify a header for a document or section?",
      options: [
        { id: "a", text: "<head>" },
        { id: "b", text: "<top>" },
        { id: "c", text: "<header>" },
        { id: "d", text: "<section>" },
      ],
      difficulty: "medium",
    },
  ],
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
  const [timeLeft, setTimeLeft] = useState("1 hour 30 minutes 0 seconds")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [questions, setQuestions] = useState(questionsBySubject[subject as keyof typeof questionsBySubject] || [])
  const [nextQuestionDifficulty, setNextQuestionDifficulty] = useState<string>("medium")

  const videoRef = useRef<HTMLVideoElement>(null)

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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        if (videoRef.current) {
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

    // Timer countdown
    const startTime = new Date().getTime()
    const examDuration = 90 * 60 * 1000 // 90 minutes in milliseconds

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

        setTimeLeft(`${hours} hour ${minutes} minutes ${seconds} seconds`)
      }
    }, 1000)

    // Cleanup function
    return () => {
      clearInterval(timer)
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
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
    if (!selectedOptions[currentQuestion.id]) {
      alert("Please select an option before marking for review.")
      return
    }

    // Mark question as reviewed
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

  // Handle finishing the exam
  const handleFinishExam = () => {
    // In a real app, you would submit all answers to the server
    alert("Exam completed! Your answers have been submitted.")
    router.push("/")
  }

  // Get question status for the status panel
  const getQuestionStatus = () => {
    const totalQuestions = questions.length
    const visited = Math.min(currentQuestionIndex + 1, totalQuestions)
    const notVisited = totalQuestions - visited
    const reviewed = reviewedQuestions.length

    return { visited, notVisited, reviewed, totalQuestions }
  }

  const status = getQuestionStatus()

  return (
    <div className="min-h-screen bg-gray-50">
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
                  disabled={lockedQuestions.includes(currentQuestion.id)}
                >
                  Mark for Review & Next
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveAndContinue}
                  disabled={!selectedOptions[currentQuestion.id] || lockedQuestions.includes(currentQuestion.id)}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish Exam" : "Save & Continue"}
                </Button>
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
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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

          {/* Debug info - would be removed in production */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Next question difficulty (from AI): {nextQuestionDifficulty}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
