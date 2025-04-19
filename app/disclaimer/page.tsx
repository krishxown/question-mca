"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Camera, Mic } from "lucide-react"

export default function DisclaimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get("subject") || "software-engineering"

  const [agreed, setAgreed] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraPermission(true)
      setMicPermission(true)

      // Store the stream in localStorage to use it on the exam page
      localStorage.setItem("mediaStreamActive", "true")

      return stream
    } catch (err) {
      console.error("Error accessing media devices:", err)
      setCameraPermission(false)
      setMicPermission(false)
      return null
    }
  }

  // Take a photo using the webcam
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame on the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/png")
        setPhotoData(dataUrl)
        setPhotoTaken(true)

        // Store the photo in localStorage to use it on the exam page
        localStorage.setItem("userPhoto", dataUrl)
      }
    }
  }

  const handleStartExam = () => {
    if (agreed && photoTaken) {
      router.push(`/exam?subject=${subject}`)
    }
  }

  useEffect(() => {
    // Request permissions when component mounts
    const initMedia = async () => {
      await requestMediaPermissions()
    }

    initMedia()

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <>
      <Navigation />
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-lg">
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
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  disabled={!cameraPermission || !micPermission}
                />
                <label
                  htmlFor="agree"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree and understand the above requirements
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleStartExam}
                disabled={!agreed || !photoTaken || !cameraPermission || !micPermission}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start Exam
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Camera and Microphone Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                  {/* Hidden canvas for taking photos */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Status indicators */}
                  <div className="absolute bottom-4 left-4 flex space-x-3">
                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        cameraPermission ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {cameraPermission === null ? "Checking..." : cameraPermission ? "Camera On" : "Camera Off"}
                    </div>

                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        micPermission ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      <Mic className="h-4 w-4 mr-1" />
                      {micPermission === null ? "Checking..." : micPermission ? "Mic On" : "Mic Off"}
                    </div>
                  </div>
                </div>

                <Button onClick={takePhoto} disabled={!cameraPermission} className="w-full">
                  Take Photo for Verification
                </Button>

                {photoTaken && photoData && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 mb-2">Photo captured successfully!</p>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photoData || "/placeholder.svg"}
                        alt="Verification Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(!cameraPermission || !micPermission) && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 text-sm">
                  Please allow camera and microphone access to continue. If you denied permission, please refresh the
                  page and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
