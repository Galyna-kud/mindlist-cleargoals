"use client"

import { type AppState, calculateLevel, xpForCurrentLevel, XP_PER_LEVEL } from "@/lib/types"
import { BarChart3, Target, Timer, Flame, Trophy, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AnalyticsPanelProps {
  state: AppState
}

export function AnalyticsPanel({ state }: AnalyticsPanelProps) {
  const { stats, todos } = state
  const level = calculateLevel(stats.totalXp)
  const currentLevelXp = xpForCurrentLevel(stats.totalXp)
  const progressPercent = (currentLevelXp / XP_PER_LEVEL) * 100

  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0

  const todayStr = new Date().toISOString().split("T")[0]
  const todayStats = stats.dailyStats.find((d) => d.date === todayStr)

  // Last 7 days activity
  const last7days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000)
    const dateStr = date.toISOString().split("T")[0]
    const dayStats = stats.dailyStats.find((d) => d.date === dateStr)
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }),
      tasks: dayStats?.tasksCompleted || 0,
      pomodoros: dayStats?.pomodorosCompleted || 0,
      xp: dayStats?.xpEarned || 0,
    }
  })

  const maxTasks = Math.max(...last7days.map((d) => d.tasks), 1)

  // Priority breakdown
  const priorityBreakdown = {
    critical: activeTodos.filter((t) => t.priority === "critical").length,
    high: activeTodos.filter((t) => t.priority === "high").length,
    medium: activeTodos.filter((t) => t.priority === "medium").length,
    low: activeTodos.filter((t) => t.priority === "low").length,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Level Card */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Level {level}</p>
            <p className="text-xs text-muted-foreground">{stats.totalXp} total XP</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentLevelXp} XP</span>
            <span>{XP_PER_LEVEL} XP</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            {XP_PER_LEVEL - currentLevelXp} XP to level {level + 1}
          </p>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Completion</span>
          </div>
          <p className="text-2xl font-bold text-foreground animate-count-up">{completionRate}%</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
          <p className="text-[10px] text-muted-foreground">Best: {stats.longestStreak}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-chart-4" />
            <span className="text-xs text-muted-foreground">Pomodoros</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalPomodorosCompleted}</p>
          <p className="text-[10px] text-muted-foreground">Today: {todayStats?.pomodorosCompleted || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{todayStats?.tasksCompleted || 0}</p>
          <p className="text-[10px] text-muted-foreground">+{todayStats?.xpEarned || 0} XP</p>
        </div>
      </div>

      {/* 7-day chart */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">7-Day Activity</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {last7days.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-16">
                <div
                  className="w-full max-w-6 rounded-t-md bg-primary/80 transition-all duration-500"
                  style={{ height: `${Math.max(4, (day.tasks / maxTasks) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="glass-strong rounded-2xl p-5">
        <span className="text-sm font-medium text-foreground mb-3 block">Active by Priority</span>
        <div className="flex flex-col gap-2">
          {[
            { label: "Critical", count: priorityBreakdown.critical, color: "bg-destructive" },
            { label: "High", count: priorityBreakdown.high, color: "bg-accent" },
            { label: "Medium", count: priorityBreakdown.medium, color: "bg-chart-4" },
            { label: "Low", count: priorityBreakdown.low, color: "bg-muted-foreground/30" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
              <span className="text-xs font-mono text-foreground">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
