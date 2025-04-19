"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { useState, useEffect } from "react"

// Mock user data - will be replaced with API data
const mockUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/placeholder.svg?height=32&width=32",
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState(mockUserData)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  // Skip navigation on login page
  if (pathname === "/login") return null

  useEffect(() => {
    let loggedIn = false // Default to false
    try {
      loggedIn = localStorage.getItem("isLoggedIn") === "true"
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      // Handle the error appropriately, e.g., by setting loggedIn to false or showing an error message.
    }
    setIsLoggedIn(loggedIn)

    if (!loggedIn && pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  // This would be replaced with actual API call
  useEffect(() => {
    // Simulating API call to get user data
    // In real implementation, this would be:
    // const fetchUserData = async () => {
    //   const response = await fetch('/api/user');
    //   const data = await response.json();
    //   setUserData(data);
    // }
    // fetchUserData();
  }, [])

  const handleLogout = () => {
    // In real implementation, this would call the logout API
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    router.push("/login")
  }

  const handleViewProfile = () => {
    router.push("/profile")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="font-bold text-xl text-blue-600">
            AI Exam
          </Link>

          <nav className="flex items-center justify-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                pathname === "/about" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                pathname === "/contact" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback>
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
