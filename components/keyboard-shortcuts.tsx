"use client"

import { useState, useEffect } from "react"
import { Keyboard, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KeyboardShortcutsProps {
  onToggleAnalytics: () => void
}

const shortcuts = [
  { keys: ["N"], description: "Focus new task input" },
  { keys: ["A"], description: "Toggle analytics panel" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["1"], description: "Show all tasks" },
  { keys: ["2"], description: "Show active tasks" },
  { keys: ["3"], description: "Show completed tasks" },
  { keys: ["?"], description: "Toggle shortcuts help" },
]

export function KeyboardShortcuts({ onToggleAnalytics }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      switch (e.key) {
        case "?":
          setShowHelp((prev) => !prev)
          break
        case "n":
        case "N": {
          e.preventDefault()
          const input = document.querySelector<HTMLInputElement>('[data-shortcut="new-task"]')
          input?.focus()
          break
        }
        case "a":
        case "A":
          e.preventDefault()
          onToggleAnalytics()
          break
        case "/": {
          e.preventDefault()
          const search = document.querySelector<HTMLInputElement>('[data-shortcut="search"]')
          search?.focus()
          break
        }
        case "1": {
          const allBtn = document.querySelector<HTMLButtonElement>('[data-filter="all"]')
          allBtn?.click()
          break
        }
        case "2": {
          const activeBtn = document.querySelector<HTMLButtonElement>('[data-filter="active"]')
          activeBtn?.click()
          break
        }
        case "3": {
          const doneBtn = document.querySelector<HTMLButtonElement>('[data-filter="completed"]')
          doneBtn?.click()
          break
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onToggleAnalytics])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-4 right-4 z-40 h-8 gap-1.5 rounded-full bg-secondary/80 px-3 text-xs text-muted-foreground hover:text-foreground backdrop-blur-sm"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 w-80 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Keyboard Shortcuts</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHelp(false)}
                className="h-7 w-7 p-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.description} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-secondary px-1.5 text-[10px] font-mono text-muted-foreground border border-border/30"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
