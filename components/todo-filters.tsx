"use client"

import { type TodoFilter, type SortBy } from "@/lib/types"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TodoFiltersProps {
  filter: TodoFilter
  onFilterChange: (f: TodoFilter) => void
  search: string
  onSearchChange: (s: string) => void
  sortBy: SortBy
  onSortChange: (s: SortBy) => void
  counts: { all: number; active: number; completed: number }
}

const FILTER_TABS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
]

export function TodoFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
}: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-shortcut="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks, tags, or descriptions..."
          className="pl-10 border-border/30 bg-secondary/30 text-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-secondary/50 p-1">
          {FILTER_TABS.map((tab) => {
            const count = counts[tab.value]
            return (
              <button
                key={tab.value}
                data-filter={tab.value}
                onClick={() => onFilterChange(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[10px] font-mono ${
                    filter === tab.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-border/50 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortBy)}>
            <SelectTrigger className="h-8 w-[130px] border-border/30 bg-secondary/30 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
