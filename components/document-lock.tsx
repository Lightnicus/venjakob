"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"

interface DocumentLockProps {
  id: string
  type: "offer" | "block" | "article"
  onLockChange: (isLocked: boolean) => void
}

export function DocumentLock({ id, type, onLockChange }: DocumentLockProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBy, setLockedBy] = useState<string | null>(null)
  const [isOwnLock, setIsOwnLock] = useState(false)
  const currentUser = getCurrentUser()

  useEffect(() => {
    checkLockStatus()
    
    // Check lock status every 30 seconds
    const interval = setInterval(checkLockStatus, 30000)
    
    return () => {
      clearInterval(interval)
// Unlock document when component unmounts if it's our lock
