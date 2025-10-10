"use client"

import { cn } from "@/lib/utils"
import { BotIcon, SpeakerIcon, UserIcon } from "@/components/icons"
import { useRef } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function MessageBubble({
  message,
  onSpeak,
}: {
  message: Message
  onSpeak?: (text: string) => void
}) {
  const isUser = message.role === "user"
  const speakBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className={cn("w-full flex items-end gap-3 animate-fade-in-up", isUser ? "justify-end" : "justify-start")}
      aria-live="polite"
    >
      {!isUser && (
        <div className="size-8 rounded-full bg-accent/15 ring-1 ring-border/60 text-accent flex items-center justify-center shrink-0">
          <BotIcon size={20} color="black"/>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md",
          "transition-all duration-300",
          isUser ? "bg-primary text-primary-foreground glow-brand" : "bg-muted text-foreground glow-muted",
        )}
        role="group"
      >
        <p className="text-pretty">{message.content}</p>

        {message.role === "assistant" && onSpeak && (
          <div className="mt-2 flex items-center justify-end">
            <button
              ref={speakBtnRef}
              type="button"
              onClick={() => onSpeak?.(message.content)}
              className="inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-accent transition-colors"
              aria-label="Play response"
              title="Play response"
            >
              <SpeakerIcon />
              <span>Play</span>
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="size-8 rounded-full bg-primary/20 ring-1 ring-primary/40 text-primary flex items-center justify-center shrink-0">
          <UserIcon size={16} />
        </div>
      )}
    </div>
  )
}
