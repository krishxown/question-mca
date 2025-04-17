import { Navigation } from "@/components/navigation"
import { BookOpen, Target, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="container py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About AI Exam System</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn more about our mission, vision, and what drives us to create the best AI-powered examination platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Our Motive</h2>
            </div>
            <p className="text-gray-600">
              We aim to revolutionize the examination process by leveraging artificial intelligence to create a more
              fair, accessible, and effective assessment system that adapts to individual learning styles and needs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-600">
              To provide an intelligent examination platform that not only evaluates knowledge but also helps identify
              learning gaps and provides personalized feedback to improve educational outcomes for students worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Our Vision</h2>
            </div>
            <p className="text-gray-600">
              To become the global standard for intelligent assessment, creating a future where examinations are not
              just evaluative tools but integral parts of the learning journey that adapt to each student's unique
              needs.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
