"use client"

import { useEffect, useRef } from "react"

export function useWakeWord({
  phrase,
  enabled,
  blocked,
  onTrigger,
}: {
  phrase: string
  enabled: boolean
  blocked?: boolean
  onTrigger: () => void
}) {
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition: any =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null

    // stop if disabled, blocked, or unsupported
    if (!enabled || blocked || !SpeechRecognition) {
      try {
        recognitionRef.current?.stop?.()
      } catch {}
      recognitionRef.current = null
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event: any) => {
      try {
        let buf = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          buf += event.results[i][0]?.transcript || ""
        }
        if (!buf) return
        if (buf.toLowerCase().includes(phrase.toLowerCase())) {
          onTrigger()
        }
      } catch {
        // ignore
      }
    }

    recognition.onend = () => {
      // keep listening if still enabled
      try {
        if (enabled) recognition.start()
      } catch {
        // ignore
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // ignore
    }

    return () => {
      try {
        recognitionRef.current?.stop?.()
      } catch {}
      recognitionRef.current = null
    }
  }, [enabled, blocked, phrase, onTrigger])
}
