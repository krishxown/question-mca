import { Navigation } from "@/components/navigation"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Database, FileCode, Layout, Terminal } from "lucide-react"

// Subject data
const subjects = [
  {
    id: 1,
    name: "Software Engineering",
    description: "Principles and practices of software development",
    icon: <FileCode className="h-12 w-12 text-blue-600" />,
    color: "bg-blue-50",
  },
  {
    id: 2,
    name: "Computer Architecture",
    description: "Design and organization of computer systems",
    icon: <Database className="h-12 w-12 text-green-600" />,
    color: "bg-green-50",
  },
  {
    id: 3,
    name: "Python",
    description: "Programming with Python language",
    icon: <Terminal className="h-12 w-12 text-yellow-600" />,
    color: "bg-yellow-50",
  },
  {
    id: 4,
    name: "DSA",
    description: "Data Structures and Algorithms",
    icon: <Code className="h-12 w-12 text-purple-600" />,
    color: "bg-purple-50",
  },
  {
    id: 5,
    name: "HTML",
    description: "Web markup language and structure",
    icon: <Layout className="h-12 w-12 text-red-600" />,
    color: "bg-red-50",
  },
]

export default function HomePage() {
  return (
    <>
      <Navigation />
      <div className="container py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Select a Subject to Begin Your Smart Exam</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our range of subjects to test your knowledge with our AI-powered examination system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className={`${subject.color} flex flex-row items-center gap-4 p-6`}>
                {subject.icon}
                <div>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription className="text-gray-700">{subject.description}</CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="p-6">
                <Link href="/disclaimer" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Exam</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
