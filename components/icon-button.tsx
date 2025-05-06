"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LucideIcon } from "lucide-react"

interface IconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  disabled?: boolean
  href?: string
}

export function IconButton({ icon: Icon, label, onClick, variant = "ghost", disabled = false, href }: IconButtonProps) {
  const ButtonContent = (
    <>
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </>
  )

  const ButtonElement = href ? (
    <Button variant={variant} size="icon" disabled={disabled} asChild>
      <Link href={href}>{ButtonContent}</Link>
    </Button>
  ) : (
    <Button variant={variant} size="icon" onClick={onClick} disabled={disabled}>
      {ButtonContent}
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{ButtonElement}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
