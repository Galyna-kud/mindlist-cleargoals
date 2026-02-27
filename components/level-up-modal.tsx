"use client"

import { useEffect, useState } from "react"
import { Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LevelUpModalProps {
  level: number
  onClose: () => void
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div
        className={`glass-strong rounded-3xl p-8 text-center max-w-sm transition-all duration-500 ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* Glow ring */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs uppercase tracking-widest text-accent font-medium">Level Up!</span>
          <Sparkles className="h-4 w-4 text-accent" />
        </div>

        <h2 className="text-4xl font-bold text-foreground mb-2">Level {level}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Incredible progress! You have reached a new level. Keep pushing your limits.
        </p>

        <Button
          onClick={onClose}
          className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary rounded-xl px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
