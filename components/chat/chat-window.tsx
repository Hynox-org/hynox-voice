"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { InputBar } from "./input-bar"
import { MessageBubble } from "./message-bubble"
import { VoiceVisualizer } from "./voice-visualizer"

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
      content: "Hello! I'm Hynox. Ask me anything, or tap the mic and speak. I'll reply here.",
    },
  ])

  const [listening, setListening] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 0
  )
  
  const recognitionRef = useRef<any>(null)
  const interimTranscriptRef = useRef<string>("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Dynamic viewport height fix for mobile browsers (handles address bar issues)
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
      setViewportHeight(window.innerHeight)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)
    window.addEventListener("orientationchange", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollBehavior = messages.length > 2 ? "smooth" : "auto"
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: scrollBehavior,
      })
    }
  }, [messages])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, content }])
  }, [])

  const speakText = useCallback((text: string) => {
    try {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel() // Cancel any ongoing speech
        const utter = new SpeechSynthesisUtterance(text)
        utter.rate = 1
        utter.pitch = 1
        utter.volume = 1
        speechSynthesis.speak(utter)
      }
    } catch (error) {
      console.warn("Speech synthesis not supported:", error)
    }
  }, [])

  const stopListening = useCallback(async () => {
    setListening(false)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.stop()
      } catch (error) {
        console.warn("Error stopping recognition:", error)
      }
      recognitionRef.current = null
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const startListening = useCallback(async () => {
    if (listening) {
      await stopListening()
      return
    }

    // Request microphone access for visualizer
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(media)
    } catch (error) {
      console.warn("Microphone access denied or unavailable:", error)
    }

    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      // Fallback: Show visualizer briefly if speech recognition not available
      setListening(true)
      setTimeout(() => {
        setListening(false)
        addMessage("assistant", "Speech recognition is not supported on this browser. Please type your message instead.")
      }, 1500)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

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
        
        // Simulate assistant response (replace with actual API call)
        setTimeout(() => {
          addMessage("assistant", `You said: "${text}". This is a sample response.`)
          speakText(`You said: ${text}. This is a sample response.`)
        }, 600)
      }
      
      stopListening()
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      
      if (event.error === "no-speech") {
        addMessage("assistant", "No speech detected. Please try again.")
      } else if (event.error === "network") {
        addMessage("assistant", "Network error. Please check your connection.")
      }
      
      stopListening()
    }

    recognitionRef.current = recognition
    setListening(true)

    try {
      recognition.start()
    } catch (error) {
      console.error("Failed to start recognition:", error)
      stopListening()
    }
  }, [addMessage, listening, stopListening, speakText])


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()
      }
    }
  }, [stream])

  return (
    <div 
      className="flex flex-col w-full h-full"
      style={{
        height: `calc(var(--vh, 1vh) * 100)`,
        maxHeight: `calc(var(--vh, 1vh) * 100)`,
      }}
    >
      {/* Messages scroll container - optimized for mobile */}
      <div
        ref={scrollRef}
        className="
          flex-1 
          overflow-y-auto 
          overflow-x-hidden
          px-3 sm:px-4 md:px-6
          py-3 sm:py-4
          rounded-xl md:rounded-2xl 
          border border-border/60 
          bg-background/40 
          glow-muted
          overscroll-behavior-contain
          -webkit-overflow-scrolling-touch
        "
        style={{
          minHeight: "60vh",
          maxHeight: "calc(100% - 120px)",
        }}
      >
        <div 
          className="
            mx-auto 
            w-full 
            max-w-3xl 
            py-2 md:py-3 
            flex flex-col 
            gap-3 md:gap-4
          "
        >
          {messages.map((m) => (
            <MessageBubble 
              key={m.id} 
              message={m} 
              onSpeak={speakText} 
            />
          ))}
        </div>
      </div>

      {/* Voice visualizer - shown when listening */}
      {listening && (
        <div className="py-3 md:py-4 px-3 sm:px-4">
              <VoiceVisualizer 
            stream={stream} 
            listening={listening} 
          />
        </div>
      )}

      {/* Input bar - sticky bottom with safe area support */}
      <div
        className="
          sticky 
          bottom-0 
          left-0 
          right-0
          z-10
          bg-background/80 
          backdrop-blur-md 
          supports-[backdrop-filter]:backdrop-blur-lg
          border-t border-border/40
          pt-3 sm:pt-4
          px-3 sm:px-4 md:px-6
        "
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
        }}
      >
        <InputBar
          onSend={(text) => {
            if (!text.trim()) return
            
            addMessage("user", text)
            console.log("Chat Context:", text, "File URL:", fileUrl)
            
            // Simulate assistant response (replace with actual API call)
            setTimeout(() => {
              addMessage("assistant", `Got it: "${text}". How can I help further?`)
              speakText(`Got it: ${text}. How can I help further?`)
            }, 500)
          }}
          onMicToggle={startListening}
          listening={listening}
        />
      </div>
    </div>
  )
}
