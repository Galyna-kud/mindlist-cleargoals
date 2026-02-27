"use client"

import { type Todo } from "@/lib/types"
import { Brain, Coffee, Zap, Flame, Sunrise, Sun, Sunset, Moon } from "lucide-react"

interface EnergyAdvisorProps {
  todos: Todo[]
  onFocusTodo: (id: string) => void
}

function getTimeOfDay(): { label: string; icon: React.ReactNode; suggestedEnergy: string } {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12)
    return { label: "Morning", icon: <Sunrise className="h-4 w-4 text-accent" />, suggestedEnergy: "high" }
  if (hour >= 12 && hour < 14)
    return { label: "Midday", icon: <Sun className="h-4 w-4 text-accent" />, suggestedEnergy: "low" }
  if (hour >= 14 && hour < 18)
    return { label: "Afternoon", icon: <Sunset className="h-4 w-4 text-accent" />, suggestedEnergy: "medium" }
  return { label: "Evening", icon: <Moon className="h-4 w-4 text-chart-4" />, suggestedEnergy: "low" }
}

const EnergyIcon = ({ energy }: { energy: string }) => {
  switch (energy) {
    case "low":
      return <Coffee className="h-3.5 w-3.5 text-chart-4" />
    case "medium":
      return <Zap className="h-3.5 w-3.5 text-accent" />
    case "high":
      return <Flame className="h-3.5 w-3.5 text-destructive" />
    default:
      return null
  }
}

export function EnergyAdvisor({ todos, onFocusTodo }: EnergyAdvisorProps) {
  const activeTodos = todos.filter((t) => !t.completed)
  const timeInfo = getTimeOfDay()

  const recommended = activeTodos
    .filter((t) => t.energy === timeInfo.suggestedEnergy)
    .slice(0, 3)

  if (recommended.length === 0) return null

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Smart Picks</span>
        <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
          {timeInfo.icon}
          <span>{timeInfo.label}</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        Based on your energy levels, these tasks are perfect for right now:
      </p>
      <div className="flex flex-col gap-2">
        {recommended.map((todo) => (
          <button
            key={todo.id}
            onClick={() => onFocusTodo(todo.id)}
            className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-left transition-colors hover:bg-secondary/50"
          >
            <EnergyIcon energy={todo.energy} />
            <span className="text-xs text-foreground truncate flex-1">{todo.title}</span>
            <span className="text-[10px] text-primary font-mono capitalize">{todo.energy}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
