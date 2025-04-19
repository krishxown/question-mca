"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Mic, Clock } from "lucide-react"

export default function ExamPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState("1 hour 30 minutes 0 seconds")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock question data
  const question = {
    id: 1,
    text: "SBI card launched multi-purpose smart card with which organisation?",
    options: [
      { id: "a", text: "IRCTC" },
      { id: "b", text: "ITO" },
      { id: "c", text: "DMRC" },
      { id: "d", text: "DTC" },
    ],
  }

  // Generate question number buttons
  const questionNumbers = Array.from({ length: 20 }, (_, i) => i + 1)

  // Initialize webcam
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 min-h-screen">
        {/* Left Column - 25% width */}
        <div className="bg-blue-50 p-4 flex flex-col">
          <div className="flex flex-col items-center mb-6 pt-4">
            <Avatar className="h-20 w-20 mb-2">
              {userPhoto ? (
                <AvatarImage src={userPhoto || "/placeholder.svg"} alt="Student" />
              ) : (
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Student" />
              )}
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <h2 className="font-medium">John Doe</h2>
          </div>

          <h1 className="text-xl font-bold text-center mb-6">MOCK EXAM</h1>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {questionNumbers.map((num) => (
              <Button
                key={num}
                variant={num === 1 ? "default" : "outline"}
                className={`h-10 w-10 p-0 ${num === 1 ? "bg-blue-600" : ""}`}
              >
                {num}
              </Button>
            ))}
          </div>

          <Button variant="outline" disabled className="mt-auto mb-4">
            Take a break
          </Button>
        </div>

        {/* Middle Column - 50% width */}
        <div className="col-span-1 md:col-span-2 p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Screen 1</h2>
          </div>

          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              You have moved 3 times from the Test window. After 5 moves, your test will be auto-submitted.
            </AlertDescription>
          </Alert>

          <Card className="flex-1 mb-4">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Question 1:</h3>
                  <p className="text-gray-700">{question.text}</p>
                </div>

                <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption}>
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                      <Label htmlFor={`option-${option.id}`} className="cursor-pointer flex-1">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
              Mark for Review
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Save & Continue</Button>
          </div>
        </div>

        {/* Right Column - 25% width */}
        <div className="bg-gray-50 p-4 border-l">
          <div className="bg-blue-100 p-3 rounded-lg mb-6 flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">{timeLeft}</span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="font-medium mb-3">Question Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Visited</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  0/23
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Not Visited</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                  23
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Review</span>
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                  0
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="font-medium mb-3">Camera Preview</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-green-600 font-medium">Mic is On</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
