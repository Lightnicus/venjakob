"use client"

// This is a simplified version of the toast hook
export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
      console.log(`Toast: ${title} - ${description} (${variant || "default"})`)
      // In a real app, this would show a toast notification
    },
  }
}
