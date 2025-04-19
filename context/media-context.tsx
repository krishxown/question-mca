"use client"

import type React from "react"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type MediaContextType = {
  startMediaStream: () => Promise<MediaStream | null>
  stopMediaStream: () => void
  isMediaActive: boolean
}

const MediaContext = createContext<MediaContextType>({
  startMediaStream: async () => null,
  stopMediaStream: () => {},
  isMediaActive: false,
})

export const useMedia = () => useContext(MediaContext)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [isMediaActive, setIsMediaActive] = useState(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const pathname = usePathname()

  // Start media stream
  const startMediaStream = async () => {
    try {
      if (mediaStreamRef.current) {
        return mediaStreamRef.current
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      mediaStreamRef.current = stream
      setIsMediaActive(true)
      return stream
    } catch (err) {
      console.error("Error accessing media devices:", err)
      setIsMediaActive(false)
      return null
    }
  }

  // Stop media stream
  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
      setIsMediaActive(false)
    }
  }

  // Automatically stop media stream when navigating away from exam or disclaimer pages
  useEffect(() => {
    const isExamPage = pathname === "/exam" || pathname.startsWith("/exam?")
    const isDisclaimerPage = pathname === "/disclaimer" || pathname.startsWith("/disclaimer?")

    if (!isExamPage && !isDisclaimerPage) {
      stopMediaStream()
    }

    // Cleanup on unmount
    return () => {
      if (!isExamPage && !isDisclaimerPage) {
        stopMediaStream()
      }
    }
  }, [pathname])

  return (
    <MediaContext.Provider value={{ startMediaStream, stopMediaStream, isMediaActive }}>
      {children}
    </MediaContext.Provider>
  )
}
