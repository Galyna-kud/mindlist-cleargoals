import {
  type Todo,
  type UserStats,
  type PomodoroSession,
  type AppState,
  type Priority,
  type EnergyLevel,
  type Subtask,
  BASE_XP,
  POMODORO_XP,
  STREAK_BONUS_XP,
  calculateLevel,
  PRIORITY_CONFIG,
} from "./types"

const STORAGE_KEY = "zenflow-app-state"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function getDefaultStats(): UserStats {
  return {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    dailyStats: [],
    totalTasksCompleted: 0,
    totalPomodorosCompleted: 0,
  }
}

function getDefaultState(): AppState {
  return {
    todos: [],
    stats: getDefaultStats(),
    pomodoroSessions: [],
  }
}

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    return JSON.parse(raw) as AppState
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable
  }
}

export function addTodo(
  state: AppState,
  title: string,
  opts?: {
    description?: string
    priority?: Priority
    energy?: EnergyLevel
    tags?: string[]
    deadline?: number
  }
): AppState {
  const todo: Todo = {
    id: generateId(),
    title,
    description: opts?.description || "",
    completed: false,
    createdAt: Date.now(),
    priority: opts?.priority || "medium",
    energy: opts?.energy || "medium",
    tags: opts?.tags || [],
    pomodorosSpent: 0,
    subtasks: [],
    xpEarned: 0,
  }
  if (opts?.deadline) todo.deadline = opts.deadline
  return { ...state, todos: [todo, ...state.todos] }
}

export function updateTodo(state: AppState, id: string, updates: Partial<Todo>): AppState {
  return {
    ...state,
    todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  }
}

export function deleteTodo(state: AppState, id: string): AppState {
  return { ...state, todos: state.todos.filter((t) => t.id !== id) }
}

export function toggleTodo(state: AppState, id: string): AppState {
  const todo = state.todos.find((t) => t.id === id)
  if (!todo) return state

  const nowCompleted = !todo.completed
  let newStats = { ...state.stats }
  let xpEarned = 0

  if (nowCompleted) {
    const multiplier = PRIORITY_CONFIG[todo.priority].xpMultiplier
    xpEarned = Math.round(BASE_XP * multiplier)

    // Subtask bonus
    const completedSubtasks = todo.subtasks.filter((s) => s.completed).length
    xpEarned += completedSubtasks * 5

    // Streak check
    const today = getTodayStr()
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    if (newStats.lastActiveDate === yesterday || newStats.lastActiveDate === today) {
      if (newStats.lastActiveDate === yesterday) {
        newStats.currentStreak += 1
      }
    } else if (newStats.lastActiveDate !== today) {
      newStats.currentStreak = 1
    }

    if (newStats.currentStreak > 0) {
      xpEarned += STREAK_BONUS_XP
    }

    newStats.lastActiveDate = today
    newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak)
    newStats.totalXp += xpEarned
    newStats.level = calculateLevel(newStats.totalXp)
    newStats.totalTasksCompleted += 1

    // Update daily stats
    const dailyIdx = newStats.dailyStats.findIndex((d) => d.date === today)
    if (dailyIdx >= 0) {
      newStats.dailyStats[dailyIdx].tasksCompleted += 1
      newStats.dailyStats[dailyIdx].xpEarned += xpEarned
    } else {
      newStats.dailyStats.push({
        date: today,
        tasksCompleted: 1,
        pomodorosCompleted: 0,
        xpEarned,
      })
    }
  } else {
    // Uncompleting - subtract XP
    xpEarned = -(todo.xpEarned || 0)
    newStats.totalXp = Math.max(0, newStats.totalXp + xpEarned)
    newStats.level = calculateLevel(newStats.totalXp)
    newStats.totalTasksCompleted = Math.max(0, newStats.totalTasksCompleted - 1)
  }

  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === id
        ? {
            ...t,
            completed: nowCompleted,
            completedAt: nowCompleted ? Date.now() : undefined,
            xpEarned: nowCompleted ? xpEarned : 0,
          }
        : t
    ),
    stats: newStats,
  }
}

export function addSubtask(state: AppState, todoId: string, title: string): AppState {
  const subtask: Subtask = { id: generateId(), title, completed: false }
  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
    ),
  }
}

export function toggleSubtask(state: AppState, todoId: string, subtaskId: string): AppState {
  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId
        ? {
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          }
        : t
    ),
  }
}

export function deleteSubtask(state: AppState, todoId: string, subtaskId: string): AppState {
  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId
        ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
        : t
    ),
  }
}

export function completePomodoroSession(state: AppState, todoId: string, duration: number): AppState {
  const session: PomodoroSession = {
    todoId,
    startedAt: Date.now() - duration * 1000,
    duration,
    completed: true,
  }

  const today = getTodayStr()
  let newStats = { ...state.stats }
  newStats.totalXp += POMODORO_XP
  newStats.level = calculateLevel(newStats.totalXp)
  newStats.totalPomodorosCompleted += 1

  const dailyIdx = newStats.dailyStats.findIndex((d) => d.date === today)
  if (dailyIdx >= 0) {
    newStats.dailyStats[dailyIdx].pomodorosCompleted += 1
    newStats.dailyStats[dailyIdx].xpEarned += POMODORO_XP
  } else {
    newStats.dailyStats.push({
      date: today,
      tasksCompleted: 0,
      pomodorosCompleted: 1,
      xpEarned: POMODORO_XP,
    })
  }

  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId ? { ...t, pomodorosSpent: t.pomodorosSpent + 1 } : t
    ),
    stats: newStats,
    pomodoroSessions: [...state.pomodoroSessions, session],
  }
}

export function getSmartSuggestion(todos: Todo[]): string {
  const hour = new Date().getHours()
  const activeTodos = todos.filter((t) => !t.completed)

  if (activeTodos.length === 0) return "All clear! Add new tasks to stay productive."

  const overdue = activeTodos.filter((t) => t.deadline && t.deadline < Date.now())
  if (overdue.length > 0) return `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Tackle them first!`

  if (hour >= 6 && hour < 12) {
    const highEnergy = activeTodos.filter((t) => t.energy === "high")
    if (highEnergy.length > 0)
      return "Morning peak! Perfect time for high-energy tasks."
  }

  if (hour >= 12 && hour < 14) {
    const lowEnergy = activeTodos.filter((t) => t.energy === "low")
    if (lowEnergy.length > 0) return "Post-lunch dip. Try some low-energy tasks."
  }

  if (hour >= 14 && hour < 18) {
    const medEnergy = activeTodos.filter((t) => t.energy === "medium")
    if (medEnergy.length > 0) return "Afternoon focus. Medium-energy tasks are ideal."
  }

  if (hour >= 18) {
    const lowEnergy = activeTodos.filter((t) => t.energy === "low")
    if (lowEnergy.length > 0) return "Evening wind-down. Wrap up light tasks."
  }

  const critical = activeTodos.filter((t) => t.priority === "critical")
  if (critical.length > 0) return `${critical.length} critical task${critical.length > 1 ? "s" : ""} need your attention!`

  return "Stay focused. One task at a time."
}
