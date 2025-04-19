"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, User } from "lucide-react"

// Mock user data - will be replaced with API data
const mockUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/placeholder.svg?height=120&width=120",
}

export default function ProfilePage() {
  const [userData, setUserData] = useState(mockUserData)

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

  return (
    <>
      <Navigation />
      <div className="container py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">View and manage your personal information.</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
              <AvatarFallback>
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{userData.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{userData.phone}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p>Student</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
