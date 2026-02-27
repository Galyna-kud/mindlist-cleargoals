"use client"

import { type UserStats, calculateLevel, xpForCurrentLevel, XP_PER_LEVEL } from "@/lib/types"
import { Flame, Zap, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface HeaderProps {
  stats: UserStats
  suggestion: string
}

export function Header({ stats, suggestion }: HeaderProps) {
  const level = calculateLevel(stats.totalXp)
  const currentLevelXp = xpForCurrentLevel(stats.totalXp)
  const progressPercent = (currentLevelXp / XP_PER_LEVEL) * 100

  return (
    <header className="glass-strong rounded-2xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">ZenFlow</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {suggestion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-2">
            <Flame className="h-4 w-4 text-accent" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Streak</span>
              <span className="text-sm font-semibold text-foreground">{stats.currentStreak} days</span>
            </div>
          </div>

          {/* Level + XP */}
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Level {level}</span>
                <span className="text-xs font-mono text-primary">{stats.totalXp} XP</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 w-24" />
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-2">
            <Zap className="h-4 w-4 text-chart-4" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Done</span>
              <span className="text-sm font-semibold text-foreground">{stats.totalTasksCompleted}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
