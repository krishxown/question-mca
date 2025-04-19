"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Home } from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [subject, setSubject] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get exam results from localStorage
    const examScore = localStorage.getItem("examScore")
    const examTotalQuestions = localStorage.getItem("totalQuestions")
    const examAnsweredQuestions = localStorage.getItem("answeredQuestions")
    const examSubject = localStorage.getItem("examSubject")

    if (examScore && examTotalQuestions && examAnsweredQuestions) {
      setScore(Number.parseInt(examScore))
      setTotalQuestions(Number.parseInt(examTotalQuestions))
      setAnsweredQuestions(Number.parseInt(examAnsweredQuestions))
      setSubject(examSubject || "")
    } else {
      // If no results found, redirect to home
      router.push("/")
    }

    setLoading(false)
  }, [router])

  const getSubjectName = (slug: string) => {
    const subjectMap: Record<string, string> = {
      "software-engineering": "Software Engineering",
      "computer-architecture": "Computer Architecture",
      python: "Python",
      dsa: "Data Structures and Algorithms",
      html: "HTML",
    }
    return subjectMap[slug] || slug
  }

  const getPercentage = () => {
    return Math.round((score / totalQuestions) * 100)
  }

  const getGrade = () => {
    const percentage = getPercentage()
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const getPerformanceText = () => {
    const percentage = getPercentage()
    if (percentage >= 90) return "Excellent"
    if (percentage >= 80) return "Very Good"
    if (percentage >= 70) return "Good"
    if (percentage >= 60) return "Satisfactory"
    if (percentage >= 50) return "Needs Improvement"
    return "Poor"
  }

  const getPerformanceColor = () => {
    const percentage = getPercentage()
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 50) return "text-amber-600"
    return "text-red-600"
  }

  const handleReturnHome = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading results...</div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="container py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Exam Results</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here's how you performed in your {getSubjectName(subject)} exam.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center border-b pb-6">
              <CardTitle className="text-2xl">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* Score Display */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-50 mb-4">
                    <div className="text-3xl font-bold text-blue-600">{getPercentage()}%</div>
                  </div>
                  <h2 className={`text-2xl font-bold ${getPerformanceColor()}`}>{getPerformanceText()}</h2>
                  <p className="text-gray-600 mt-1">Grade: {getGrade()}</p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-sm font-medium">
                      {score} / {totalQuestions}
                    </span>
                  </div>
                  <Progress value={getPercentage()} className="h-3" />
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Correct Answers</p>
                      <p className="font-bold">{score}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg flex items-center">
                    <XCircle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Incorrect Answers</p>
                      <p className="font-bold">{answeredQuestions - score}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg flex items-center">
                    <AlertCircle className="h-8 w-8 text-amber-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Unanswered</p>
                      <p className="font-bold">{totalQuestions - answeredQuestions}</p>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-2">Feedback</h3>
                  <p className="text-gray-700">
                    {getPercentage() >= 70
                      ? "Great job! You've demonstrated a solid understanding of the subject matter. Keep up the good work!"
                      : getPercentage() >= 50
                        ? "You've shown a basic understanding of the subject. With more practice and study, you can improve your performance."
                        : "You may need to review the subject material more thoroughly. Consider seeking additional resources or help to strengthen your understanding."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center pt-4">
                  <Button onClick={handleReturnHome} className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
