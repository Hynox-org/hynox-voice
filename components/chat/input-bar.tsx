"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowIcon, MicIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

export function InputBar({
  onSend,
  onMicToggle,
  listening,
}: {
  onSend: (text: string) => void
  onMicToggle: () => void
  listening: boolean
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

          <button
            type="button"
            onClick={onMicToggle}
            className={cn(
              "size-10 rounded-full flex items-center justify-center transition-colors",
              listening
                ? "bg-red-500 text-white hover:bg-red-600 glow-red"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label={listening ? "Stop listening" : "Start listening"}
            title={listening ? "Stop listening" : "Start listening"}
          >
            <MicIcon size={20} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-foreground/60">Press Enter to send • Tap mic to speak</p>
    </div>
  )
}
