"use client"

import { Inbox, ListChecks, Sparkles } from "lucide-react"

interface EmptyStateProps {
  type: "no-tasks" | "no-results" | "all-done"
}

export function EmptyState({ type }: EmptyStateProps) {
  const configs = {
    "no-tasks": {
      icon: <Inbox className="h-10 w-10 text-muted-foreground/40" />,
      title: "Your canvas is empty",
      description: "Add your first task to start your productivity journey. Press N to quick-add.",
    },
    "no-results": {
      icon: <ListChecks className="h-10 w-10 text-muted-foreground/40" />,
      title: "No matching tasks",
      description: "Try adjusting your search or filters to find what you are looking for.",
    },
    "all-done": {
      icon: <Sparkles className="h-10 w-10 text-primary/40" />,
      title: "All tasks completed",
      description: "Outstanding work! Add new challenges or take a well-deserved break.",
    },
  }

  const config = configs[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="animate-float">{config.icon}</div>
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-sm font-medium text-foreground">{config.title}</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{config.description}</p>
      </div>
    </div>
  )
}
