"use client"

import type React from "react"

import { TooltipProvider as RadixTooltipProvider } from "@/components/ui/tooltip"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
  skipDelayDuration?: number
}

export function TooltipProvider({ children, delayDuration = 300, skipDelayDuration = 300 }: TooltipProviderProps) {
  return (
    <RadixTooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </RadixTooltipProvider>
  )
}
