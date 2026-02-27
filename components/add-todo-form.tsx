"use client"

import { useState } from "react"
import { type Priority, type EnergyLevel } from "@/lib/types"
import { Plus, ChevronDown, ChevronUp, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface AddTodoFormProps {
  onAdd: (
    title: string,
    opts: {
      description?: string
      priority?: Priority
      energy?: EnergyLevel
      tags?: string[]
      deadline?: number
    }
  ) => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string; class: string }[] = [
  { value: "low", label: "Low", class: "border-muted-foreground/30 text-muted-foreground hover:bg-muted" },
  { value: "medium", label: "Medium", class: "border-chart-4/30 text-chart-4 hover:bg-chart-4/10" },
  { value: "high", label: "High", class: "border-accent/30 text-accent hover:bg-accent/10" },
  { value: "critical", label: "Critical", class: "border-destructive/30 text-destructive hover:bg-destructive/10" },
]

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; class: string }[] = [
  { value: "low", label: "Low", class: "border-chart-4/30 text-chart-4 hover:bg-chart-4/10" },
  { value: "medium", label: "Medium", class: "border-accent/30 text-accent hover:bg-accent/10" },
  { value: "high", label: "High", class: "border-destructive/30 text-destructive hover:bg-destructive/10" },
]

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [energy, setEnergy] = useState<EnergyLevel>("medium")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [deadline, setDeadline] = useState("")
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd(title.trim(), {
      description: description.trim() || undefined,
      priority,
      energy,
      tags,
      deadline: deadline ? new Date(deadline).getTime() : undefined,
    })

    setTitle("")
    setDescription("")
    setPriority("medium")
    setEnergy("medium")
    setTags([])
    setTagInput("")
    setDeadline("")
    setExpanded(false)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <Input
          data-shortcut="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          Add
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-200">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="min-h-[60px] resize-none border-border/30 bg-secondary/30 text-sm"
          />

          <div className="flex flex-col gap-3">
            {/* Priority */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      priority === opt.value
                        ? opt.class + " bg-current/10 ring-1 ring-current/20"
                        : "border-border/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Energy Required</span>
              <div className="flex flex-wrap gap-2">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEnergy(opt.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      energy === opt.value
                        ? opt.class + " bg-current/10 ring-1 ring-current/20"
                        : "border-border/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline & Tags row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Deadline
                </span>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-auto border-border/30 bg-secondary/30 text-sm"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tags
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer text-xs hover:bg-destructive/20"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} &times;
                    </Badge>
                  ))}
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag..."
                    className="h-7 w-24 border-border/30 bg-secondary/30 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
