"use client"

import { cn } from "@/lib/utils"
import { useId } from "react"

export function HynoxVoiceButton({
  active,
  onToggle,
  wakeWordEnabled,
  onWakeWordToggle,
}: {
  active: boolean
  onToggle: () => void
  wakeWordEnabled: boolean
  onWakeWordToggle: (v: boolean) => void
}) {
  const id = useId()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        aria-label={active ? "Stop Hynox Voice" : "Start Hynox Voice"}
        title={active ? "Stop Hynox Voice" : "Start Hynox Voice"}
        className={cn("hynox-orb", active && "is-active glow-brand")}
      >
        <span className="core" />
        {active && (
          <>
            <span className="ring" aria-hidden="true" />
            <span className="pulse" aria-hidden="true" />
          </>
        )}
      </button>

      <label htmlFor={id} className="flex items-center gap-2 text-xs text-foreground/70">
        <input
          id={id}
          type="checkbox"
          className="accent-current"
          checked={wakeWordEnabled}
          onChange={(e) => onWakeWordToggle(e.target.checked)}
          aria-label="Enable 'Hynox' wake word"
          title="Enable 'Hynox' wake word"
        />
        <span>Say “Hynox” to wake</span>
      </label>
    </div>
  )
}
