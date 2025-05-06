"use client"

import { useState } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props])
  }

  const dismiss = (index: number) => {
    setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index))
  }

  return {
    toasts,
    toast,
    dismiss,
  }
}

export { useToast }
