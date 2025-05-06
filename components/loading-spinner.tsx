import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-t-2 border-primary", className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${Math.max(2, size / 12)}px`,
      }}
    />
  )
}
