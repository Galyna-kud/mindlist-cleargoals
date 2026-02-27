"use client"

import { useState } from "react"
import { type Todo, type Priority, type EnergyLevel, PRIORITY_CONFIG } from "@/lib/types"
import {
  Check,
  Trash2,
  Pencil,
  Timer,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Coffee,
  Zap,
  Flame,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDistanceToNow } from "date-fns"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onAddSubtask: (todoId: string, title: string) => void
  onToggleSubtask: (todoId: string, subtaskId: string) => void
  onDeleteSubtask: (todoId: string, subtaskId: string) => void
  onStartPomodoro: (todoId: string) => void
}

const EnergyIcon = ({ energy }: { energy: EnergyLevel }) => {
  switch (energy) {
    case "low":
      return <Coffee className="h-3.5 w-3.5" />
    case "medium":
      return <Zap className="h-3.5 w-3.5" />
    case "high":
      return <Flame className="h-3.5 w-3.5" />
  }
}

const PriorityIndicator = ({ priority }: { priority: Priority }) => {
  const config = PRIORITY_CONFIG[priority]
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
      {priority === "critical" && <AlertTriangle className="h-3 w-3" />}
      {config.label}
    </div>
  )
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartPomodoro,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const isOverdue = todo.deadline && !todo.completed && todo.deadline < Date.now()
  const subtaskProgress =
    todo.subtasks.length > 0
      ? Math.round((todo.subtasks.filter((s) => s.completed).length / todo.subtasks.length) * 100)
      : 0

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, { title: editTitle.trim() })
    }
    setEditing(false)
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubtask.trim()) {
      onAddSubtask(todo.id, newSubtask.trim())
      setNewSubtask("")
    }
  }

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 ${
        todo.completed
          ? "border-border/20 bg-secondary/20 opacity-70"
          : isOverdue
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/30 bg-card/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      {/* Priority stripe */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
          todo.priority === "critical"
            ? "bg-destructive"
            : todo.priority === "high"
            ? "bg-accent"
            : todo.priority === "medium"
            ? "bg-chart-4"
            : "bg-muted-foreground/30"
        }`}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
              todo.completed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40 hover:border-primary"
            }`}
          >
            {todo.completed && <Check className="h-3 w-3" />}
          </button>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit()
                    if (e.key === "Escape") setEditing(false)
                  }}
                  autoFocus
                  className="h-7 text-sm border-primary/30"
                />
                <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-7 px-2">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 px-2">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <p
                className={`text-sm font-medium leading-relaxed ${
                  todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {todo.title}
              </p>
            )}

            {todo.description && !editing && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{todo.description}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2">
              <PriorityIndicator priority={todo.priority} />
              <span className="text-border">|</span>
              <div className={`flex items-center gap-1 text-xs ${
                todo.energy === "high" ? "text-destructive" : todo.energy === "medium" ? "text-accent" : "text-chart-4"
              }`}>
                <EnergyIcon energy={todo.energy} />
                <span className="capitalize">{todo.energy}</span>
              </div>

              {todo.deadline && (
                <>
                  <span className="text-border">|</span>
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    <Clock className="h-3 w-3" />
                    {isOverdue ? "Overdue" : formatDistanceToNow(todo.deadline, { addSuffix: true })}
                  </div>
                </>
              )}

              {todo.pomodorosSpent > 0 && (
                <>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Timer className="h-3 w-3" />
                    {todo.pomodorosSpent}
                  </div>
                </>
              )}

              {todo.xpEarned > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-xs font-mono text-primary">+{todo.xpEarned} XP</span>
                </>
              )}
            </div>

            {/* Tags */}
            {todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {todo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-border/40 text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Subtask progress */}
            {todo.subtasks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-secondary">
                  <div
                    className="h-1 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!todo.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStartPomodoro(todo.id)}
                className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                title="Start Pomodoro"
              >
                <Timer className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditTitle(todo.title)
                setEditing(true)
              }}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(todo.id)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Expanded: Subtasks */}
        {expanded && (
          <div className="mt-4 ml-8 flex flex-col gap-2 border-t border-border/20 pt-3 animate-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subtasks</span>
            {todo.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 group/sub">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(todo.id, subtask.id)}
                  className="h-4 w-4"
                />
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {subtask.title}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteSubtask(todo.id, subtask.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="h-7 flex-1 text-sm border-border/20 bg-secondary/20"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
