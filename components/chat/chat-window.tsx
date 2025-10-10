"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { InputBar } from "./input-bar"
import { MessageBubble } from "./message-bubble"
import { VoiceVisualizer } from "./voice-visualizer"
import { useWakeWord } from "./use-wake-word"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWindow({ fileUrl }: { fileUrl: string | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I’m Hynox. Ask me anything, or tap the mic and speak. I’ll reply here.",
    },
  ])

  const [listening, setListening] = useState(false)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const interimTranscriptRef = useRef<string>("")

  // Outer scroll container ref
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, content }])
  }, [])

  const speakText = useCallback((text: string) => {
    try {
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1
      utter.pitch = 1
      utter.volume = 1
      speechSynthesis.speak(utter)
    } catch {
      // no-op if not supported
    }
  }, [])

  const stopListening = useCallback(async () => {
    setListening(false)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      } catch {}
      recognitionRef.current = null
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [stream])

  const startListening = useCallback(async () => {
    if (listening) {
      await stopListening()
      return
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(media)
    } catch {
      // Mic could be blocked, still allow speech recognition to attempt without waveform
    }

    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setListening(true)
      // Fallback: short “recording” period just to show visualizer UI
      setTimeout(() => {
        setListening(false)
      }, 1500)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false

    interimTranscriptRef.current = ""
    recognition.onresult = (event: any) => {
      let interim = ""
      let finalText = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      interimTranscriptRef.current = (finalText || interim).trim()
    }

    recognition.onend = () => {
      const text = interimTranscriptRef.current.trim()
      if (text) {
        addMessage("user", text)
        // Demo assistant reply
        setTimeout(() => {
          addMessage("assistant", `You said: “${text}”. This is a sample response.`)
        }, 600)
      }
      stopListening()
    }

    recognitionRef.current = recognition
    setListening(true)
    try {
      recognition.start()
    } catch {
      // ignored
    }
  }, [addMessage, listening, stopListening])

  useWakeWord({
    phrase: "hynox",
    enabled: wakeWordEnabled && !listening,
    blocked: false,
    onTrigger: () => {
      // auto-start listening
      startListening()
    },
  })

  // Optional: dynamic --vh update to improve legacy mobile behavior
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }
    setVH()
    window.addEventListener("resize", setVH)
    return () => window.removeEventListener("resize", setVH)
  }, [])

  return (
    <div className="flex flex-col h-[calc(var(--vh,1vh)*100)] md:h-auto gap-3 md:gap-5">
      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        className="
          flex-1
          min-h-[50svh] md:min-h-[60vh]
          max-h-[70svh] md:max-h-[70vh]
          overflow-y-auto px-2 py-2
          rounded-2xl border border-border/60 bg-background/40 glow-muted
        "
      >
        <div className="mx-auto w-full max-w-3xl py-2 md:py-3 flex flex-col gap-2 md:gap-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} onSpeak={speakText} />
          ))}
        </div>
      </div>

      {listening && <VoiceVisualizer stream={stream} listening={listening} />}

      {/* Sticky input with safe-area padding on mobile */}
      <div
        className="
          sticky bottom-0 left-0 right-0
          bg-background/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
          pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]
        "
      >
        <InputBar
          onSend={(text) => {
            addMessage("user", text)
            console.log("Chat Context:", text, "File URL:", fileUrl)
            setTimeout(() => {
              addMessage("assistant", `Got it: “${text}”. How can I help further?`)
            }, 500)
          }}
          onMicToggle={startListening}
          listening={listening}
          wakeWordEnabled={wakeWordEnabled}
          onWakeWordToggle={(v) => setWakeWordEnabled(v)}
        />
      </div>
    </div>
  )
}