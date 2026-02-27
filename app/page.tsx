"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { type TodoFilter, type SortBy, type Todo, type Priority, type EnergyLevel } from "@/lib/types"
import {
  loadState,
  saveState,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  completePomodoroSession,
  getSmartSuggestion,
} from "@/lib/store"
import { Header } from "@/components/header"
import { AddTodoForm } from "@/components/add-todo-form"
import { TodoFilters } from "@/components/todo-filters"
import { TodoItem } from "@/components/todo-item"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { EnergyAdvisor } from "@/components/energy-advisor"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { XpToast } from "@/components/xp-toast"
import { LevelUpModal } from "@/components/level-up-modal"
import { EmptyState } from "@/components/empty-state"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const ENERGY_ORDER: Record<EnergyLevel, number> = { high: 0, medium: 1, low: 2 }

export default function HomePage() {
  const [state, setState] = useState(() => loadState())
  const [filter, setFilter] = useState<TodoFilter>("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("newest")
  const [pomodoroTodoId, setPomodoroTodoId] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [xpToast, setXpToast] = useState<number | null>(null)
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const prevLevelRef = useRef<number>(1)
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      saveState(state)
      // Check for level up
      if (state.stats.level > prevLevelRef.current) {
        setLevelUpLevel(state.stats.level)
      }
      prevLevelRef.current = state.stats.level
    }
  }, [state, mounted])

  // Handlers
  const handleAddTodo = useCallback(
    (
      title: string,
      opts: {
        description?: string
        priority?: Priority
        energy?: EnergyLevel
        tags?: string[]
        deadline?: number
      }
    ) => {
      setState((prev) => addTodo(prev, title, opts))
    },
    []
  )

  const handleToggleTodo = useCallback(
    (id: string) => {
      const todo = state.todos.find((t) => t.id === id)
      if (todo && !todo.completed) {
        // Will earn XP
        const newState = toggleTodo(state, id)
        const updatedTodo = newState.todos.find((t) => t.id === id)
        if (updatedTodo?.xpEarned) {
          setXpToast(updatedTodo.xpEarned)
        }
        setState(newState)
      } else {
        setState((prev) => toggleTodo(prev, id))
      }
    },
    [state]
  )

  const handleDeleteTodo = useCallback(
    (id: string) => {
      setState((prev) => deleteTodo(prev, id))
      if (pomodoroTodoId === id) setPomodoroTodoId(null)
    },
    [pomodoroTodoId]
  )

  const handleUpdateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setState((prev) => updateTodo(prev, id, updates))
  }, [])

  const handleAddSubtask = useCallback((todoId: string, title: string) => {
    setState((prev) => addSubtask(prev, todoId, title))
  }, [])

  const handleToggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    setState((prev) => toggleSubtask(prev, todoId, subtaskId))
  }, [])

  const handleDeleteSubtask = useCallback((todoId: string, subtaskId: string) => {
    setState((prev) => deleteSubtask(prev, todoId, subtaskId))
  }, [])

  const handlePomodoroComplete = useCallback((todoId: string, duration: number) => {
    setState((prev) => completePomodoroSession(prev, todoId, duration))
    setXpToast(10) // POMODORO_XP
  }, [])

  // Filtered & sorted todos
  const filteredTodos = useMemo(() => {
    let result = [...state.todos]

    // Filter
    if (filter === "active") result = result.filter((t) => !t.completed)
    if (filter === "completed") result = result.filter((t) => t.completed)

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.createdAt - a.createdAt)
        break
      case "oldest":
        result.sort((a, b) => a.createdAt - b.createdAt)
        break
      case "priority":
        result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        break
      case "energy":
        result.sort((a, b) => ENERGY_ORDER[a.energy] - ENERGY_ORDER[b.energy])
        break
      case "deadline":
        result.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return a.deadline - b.deadline
        })
        break
    }

    return result
  }, [state.todos, filter, search, sortBy])

  const counts = useMemo(
    () => ({
      all: state.todos.length,
      active: state.todos.filter((t) => !t.completed).length,
      completed: state.todos.filter((t) => t.completed).length,
    }),
    [state.todos]
  )

  const suggestion = useMemo(() => getSmartSuggestion(state.todos), [state.todos])
  const pomodoroTodo = pomodoroTodoId ? state.todos.find((t) => t.id === pomodoroTodoId) || null : null

  const emptyType = state.todos.length === 0
    ? "no-tasks"
    : filteredTodos.length === 0
    ? counts.active === 0 && filter === "active"
      ? "all-done"
      : "no-results"
    : null

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 animate-pulse" />
          <span className="text-xs text-muted-foreground">Loading ZenFlow...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Ambient bg effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <Header stats={state.stats} suggestion={suggestion} />

        <div className="mt-6 flex gap-6">
          {/* Main content */}
          <div className="flex flex-1 flex-col gap-4 min-w-0">
            {/* Add form */}
            <AddTodoForm onAdd={handleAddTodo} />

            {/* Pomodoro timer */}
            {pomodoroTodo && (
              <PomodoroTimer
                todo={pomodoroTodo}
                onComplete={handlePomodoroComplete}
                onClose={() => setPomodoroTodoId(null)}
              />
            )}

            {/* Filters */}
            <TodoFilters
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
              counts={counts}
            />

            {/* Todo list */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-2 pb-20" ref={addInputRef as React.RefObject<HTMLDivElement>}>
                {emptyType ? (
                  <EmptyState type={emptyType} />
                ) : (
                  filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                      onUpdate={handleUpdateTodo}
                      onAddSubtask={handleAddSubtask}
                      onToggleSubtask={handleToggleSubtask}
                      onDeleteSubtask={handleDeleteSubtask}
                      onStartPomodoro={(id) => setPomodoroTodoId(id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Analytics sidebar */}
          <div
            className={`hidden lg:block transition-all duration-300 ${
              showAnalytics ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="flex flex-col gap-4 sticky top-6">
              <EnergyAdvisor
                todos={state.todos}
                onFocusTodo={(id) => {
                  setFilter("active")
                  setSearch("")
                  // Scroll to todo
                  setTimeout(() => {
                    document.getElementById(`todo-${id}`)?.scrollIntoView({ behavior: "smooth" })
                  }, 100)
                }}
              />
              <AnalyticsPanel state={state} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile analytics drawer */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAnalytics(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw] overflow-y-auto bg-card border-l border-border p-4 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Analytics</span>
              <Button size="sm" variant="ghost" onClick={() => setShowAnalytics(false)} className="h-7 w-7 p-0">
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <EnergyAdvisor
              todos={state.todos}
              onFocusTodo={(id) => {
                setFilter("active")
                setSearch("")
                setShowAnalytics(false)
              }}
            />
            <div className="mt-4">
              <AnalyticsPanel state={state} />
            </div>
          </div>
        </div>
      )}

      {/* Analytics toggle (desktop) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="fixed bottom-4 left-4 z-40 h-8 gap-1.5 rounded-full bg-secondary/80 px-3 text-xs text-muted-foreground hover:text-foreground backdrop-blur-sm hidden lg:flex"
      >
        {showAnalytics ? (
          <PanelRightClose className="h-3.5 w-3.5" />
        ) : (
          <PanelRightOpen className="h-3.5 w-3.5" />
        )}
        <span>Analytics</span>
      </Button>

      {/* Mobile analytics button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAnalytics(true)}
        className="fixed bottom-4 left-4 z-40 h-8 gap-1.5 rounded-full bg-secondary/80 px-3 text-xs text-muted-foreground hover:text-foreground backdrop-blur-sm lg:hidden flex"
      >
        <PanelRightOpen className="h-3.5 w-3.5" />
        <span>Stats</span>
      </Button>

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts onToggleAnalytics={() => setShowAnalytics((prev) => !prev)} />

      {/* XP Toast */}
      {xpToast !== null && <XpToast xp={xpToast} onDone={() => setXpToast(null)} />}

      {/* Level Up Modal */}
      {levelUpLevel !== null && (
        <LevelUpModal level={levelUpLevel} onClose={() => setLevelUpLevel(null)} />
      )}
    </main>
  )
}
