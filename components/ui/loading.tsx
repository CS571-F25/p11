import React from "react"

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = "", className = "" }: LoadingProps) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary dark:border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  )
}
