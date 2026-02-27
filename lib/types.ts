export type Priority = "low" | "medium" | "high" | "critical"
export type EnergyLevel = "low" | "medium" | "high"
export type TodoFilter = "all" | "active" | "completed"
export type SortBy = "newest" | "oldest" | "priority" | "energy" | "deadline"

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
  completedAt?: number
  priority: Priority
  energy: EnergyLevel
  tags: string[]
  deadline?: number
  pomodorosSpent: number
  subtasks: Subtask[]
  xpEarned: number
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface PomodoroSession {
  todoId: string
  startedAt: number
  duration: number
  completed: boolean
}

export interface DailyStats {
  date: string
  tasksCompleted: number
  pomodorosCompleted: number
  xpEarned: number
}

export interface UserStats {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  dailyStats: DailyStats[]
  totalTasksCompleted: number
  totalPomodorosCompleted: number
}

export interface AppState {
  todos: Todo[]
  stats: UserStats
  pomodoroSessions: PomodoroSession[]
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; xpMultiplier: number }> = {
  low: { label: "Low", color: "text-muted-foreground", xpMultiplier: 1 },
  medium: { label: "Medium", color: "text-chart-4", xpMultiplier: 1.5 },
  high: { label: "High", color: "text-accent", xpMultiplier: 2 },
  critical: { label: "Critical", color: "text-destructive", xpMultiplier: 3 },
}

export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; icon: string }> = {
  low: { label: "Low Energy", icon: "coffee" },
  medium: { label: "Medium Energy", icon: "zap" },
  high: { label: "High Energy", icon: "flame" },
}

export const BASE_XP = 25
export const POMODORO_XP = 10
export const STREAK_BONUS_XP = 15
export const XP_PER_LEVEL = 200

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpForCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - xpForCurrentLevel(xp)
}
