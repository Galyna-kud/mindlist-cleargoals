"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

interface XpToastProps {
  xp: number
  onDone: () => void
}

export function XpToast({ xp, onDone }: XpToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg glow-primary transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <Sparkles className="h-4 w-4 animate-pulse" />
      <span className="text-sm font-bold">+{xp} XP</span>
    </div>
  )
}
