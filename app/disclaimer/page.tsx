"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleStartExam = () => {
    router.push("/exam")
  }

  return (
    <>
      <Navigation />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Exam Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-gray-700">
                Audio and Video access is required throughout the exam. Make sure your camera and mic are turned on.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                The AI system will monitor your activity during the exam. Any suspicious behavior may result in
                disqualification.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                Do not leave the exam window or open other applications during the test. Multiple violations will
                terminate your session.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
              <label
                htmlFor="agree"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree and understand the above requirements
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartExam} disabled={!agreed} className="w-full bg-blue-600 hover:bg-blue-700">
              Start Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
