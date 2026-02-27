"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { type Todo } from "@/lib/types"
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PomodoroTimerProps {
  todo: Todo | null
  onComplete: (todoId: string, duration: number) => void
  onClose: () => void
}

const WORK_DURATION = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

type PomodoroPhase = "work" | "short-break" | "long-break"

export function PomodoroTimer({ todo, onComplete, onClose }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<PomodoroPhase>("work")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {
      // audio not available
    }
  }, [soundEnabled])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      playSound()

      if (phase === "work" && todo) {
        onComplete(todo.id, WORK_DURATION)
        const newSessions = sessionsCompleted + 1
        setSessionsCompleted(newSessions)

        if (newSessions % 4 === 0) {
          setPhase("long-break")
          setTimeLeft(LONG_BREAK)
        } else {
          setPhase("short-break")
          setTimeLeft(SHORT_BREAK)
        }
      } else {
        setPhase("work")
        setTimeLeft(WORK_DURATION)
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, phase, todo, sessionsCompleted, onComplete, playSound])

  if (!todo) return null

  const totalTime = phase === "work" ? WORK_DURATION : phase === "short-break" ? SHORT_BREAK : LONG_BREAK
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="glass-strong rounded-2xl p-6 glow-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {phase === "work" ? "Focus Time" : phase === "short-break" ? "Short Break" : "Long Break"}
          </span>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{todo.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Circular timer */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <svg width="160" height="160" className="-rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="6"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={phase === "work" ? "var(--primary)" : "var(--accent)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-foreground tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono mt-1">
              Session {sessionsCompleted + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setTimeLeft(phase === "work" ? WORK_DURATION : phase === "short-break" ? SHORT_BREAK : LONG_BREAK)
            setIsRunning(false)
          }}
          className="h-9 w-9 p-0 rounded-full border-border/30"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={`h-12 w-12 rounded-full p-0 ${
            phase === "work"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (phase === "work") {
              setPhase("short-break")
              setTimeLeft(SHORT_BREAK)
            } else {
              setPhase("work")
              setTimeLeft(WORK_DURATION)
            }
            setIsRunning(false)
          }}
          className="h-9 px-3 rounded-full border-border/30 text-xs"
        >
          {phase === "work" ? "Break" : "Work"}
        </Button>
      </div>

      {/* Session dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i < sessionsCompleted % 4 ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
