"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { HynoxVoiceButton } from "./hynox-voice-button"

export function InputBar({
  onSend,
  onMicToggle,
  listening,
  wakeWordEnabled,
  onWakeWordToggle,
}: {
  onSend: (text: string) => void
  onMicToggle: (active: boolean) => void
  listening: boolean
  wakeWordEnabled: boolean
  onWakeWordToggle: (v: boolean) => void
}) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!listening) inputRef.current?.focus()
  }, [listening])

  const submit = () => {
    const v = text.trim()
    if (!v) return
    onSend(v)
    setText("")
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-2 ring-1 ring-inset ring-border/30 glow-muted">
        <input
          ref={inputRef}
          className={cn("flex-1 bg-transparent px-3 py-2 text-sm outline-none", "placeholder:text-foreground/50")}
          type="text"
          placeholder="Type your message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          aria-label="Message input"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit()}
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity glow-brand"
            aria-label="Send message"
            title="Send"
          >
            <ArrowIcon />
          </button>

          <HynoxVoiceButton
            active={listening}
            onToggle={() => onMicToggle(!listening)}
            wakeWordEnabled={wakeWordEnabled}
            onWakeWordToggle={onWakeWordToggle}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-foreground/60">Press Enter to send • Use Hynox Voice to speak</p>
    </div>
  )
}
