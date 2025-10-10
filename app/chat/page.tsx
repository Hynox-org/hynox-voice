"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { DatabaseConnectionModal } from "@/components/chat/database-connection-modal"
import { MessageBubble } from "@/components/chat/message-bubble"
import { VoiceVisualizer } from "@/components/chat/voice-visualizer"
import { Button } from "@/components/ui/button"
import { ExcelIcon, ArrowIcon, MicIcon } from "@/components/icons"
import { createClient } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Hynox. Ask me anything, or tap the mic and speak. I'll reply here.",
    },
  ])
  const [listening, setListening] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [text, setText] = useState("") // State for input bar
  const inputRef = useRef<HTMLInputElement>(null) // Ref for input bar
  const scrollRef = useRef<HTMLDivElement | null>(null) // Ref for chat window scroll

  const recognitionRef = useRef<any>(null)
  const interimTranscriptRef = useRef<string>("")

  // Dynamic viewport height fix for mobile browsers (handles address bar issues)
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)
    window.addEventListener("orientationchange", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
    }
  }, [])

  // Check for existing connection on mount
  useEffect(() => {
    const storedFileUrl = localStorage.getItem("hynox_excel_file_url")
    const storedFileName = localStorage.getItem("hynox_excel_file_name")
    
    if (storedFileUrl) {
      setIsConnected(true)
      setFileUrl(storedFileUrl)
      
      if (storedFileName) {
        setFileName(storedFileName)
      } else {
        const name = storedFileUrl.split("/").pop()?.split("?")[0]
        setFileName(name ? decodeURIComponent(name) : null)
      }
    } else {
      setIsModalOpen(true)
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

  // Focus input bar when not listening
  useEffect(() => {
    if (!listening) inputRef.current?.focus()
  }, [listening])

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
      const userText = interimTranscriptRef.current.trim()
      
      if (userText) {
        addMessage("user", userText)
        
        // Simulate assistant response (replace with actual API call)
        setTimeout(() => {
          addMessage("assistant", `You said: "${userText}". This is a sample response.`)
          speakText(`You said: ${userText}. This is a sample response.`)
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

  const handleConnect = useCallback((url: string) => {
    const name = url.split("/").pop()?.split("?")[0]
    const decodedName = name ? decodeURIComponent(name) : null
    
    setFileUrl(url)
    setIsConnected(true)
    setFileName(decodedName)
    setError(null)
    
    // Store in localStorage
    localStorage.setItem("hynox_excel_file_url", url)
    if (decodedName) {
      localStorage.setItem("hynox_excel_file_name", decodedName)
    }
  }, [])

  const handleRemoveConnection = useCallback(async () => {
    if (!fileUrl || !fileName) return

    setIsRemoving(true)
    setError(null)

    try {
      const filePath = `excel-uploads/${fileName}`
      const { error: storageError } = await supabase.storage
        .from("file-storage")
        .remove([filePath])

      if (storageError) {
        throw storageError
      }

      // Clear localStorage
      localStorage.removeItem("hynox_excel_file_url")
      localStorage.removeItem("hynox_excel_file_name")
      
      // Reset state
      setIsConnected(false)
      setFileUrl(null)
      setFileName(null)
      setIsModalOpen(true)
    } catch (error: any) {
      console.error("Error removing file from Supabase:", error.message)
      setError(`Failed to remove file: ${error.message}`)
    } finally {
      setIsRemoving(false)
    }
  }, [fileUrl, fileName])

  const handleConnectAgain = useCallback(async () => {
    await handleRemoveConnection()
  }, [handleRemoveConnection])

  const handleSend = () => {
    const v = text.trim()
    if (!v) return
    addMessage("user", v)
    console.log("Chat Context:", v, "File URL:", fileUrl)
    
    // Simulate assistant response (replace with actual API call)
    setTimeout(() => {
      addMessage("assistant", `Got it: "${v}". How can I help further?`)
      speakText(`Got it: ${v}. This is a sample response.`)
    }, 500)
    setText("")
  }

  return (
    <main 
      className="
        min-h-screen 
        flex flex-col
        bg-background
      "
      style={{
        minHeight: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      <section className="flex-1 flex items-stretch pb-[120px]">
        <div 
          className="
            mx-auto 
            w-full 
            max-w-4xl 
            px-4 sm:px-6 md:px-8
            py-4 sm:py-6 md:py-8 
            flex flex-col 
            gap-3 sm:gap-4
          "
        >
          {isConnected && fileUrl && fileName && (
            <div 
              className="
                sticky top-20 
                z-10 
                w-full 
                flex flex-row
                sm:items-center sm:justify-between 
                gap-3 sm:gap-4
                p-30 sm:p-4 
                border rounded-lg sm:rounded-xl 
                shadow-sm 
                bg-white dark:bg-gray-800
                transition-all duration-200
              "
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <ExcelIcon 
                    className="text-green-600 dark:text-green-400" 
                    size={28} 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Connected File
                  </p>
                  <p 
                    className="
                      text-sm sm:text-base 
                      font-medium 
                      text-gray-900 dark:text-gray-100
                      truncate
                    "
                    title={fileName}
                  >
                    {fileName}
                  </p>
                </div>
              </div>

              <div 
                className="
                  flex 
                  gap-2 
                  w-full sm:w-auto
                  flex-row
                "
              >
                <Button
                  variant="outline"
                  onClick={handleRemoveConnection}
                  disabled={isRemoving}
                  className="
                    flex-1 sm:flex-none
                    min-h-[44px] sm:min-h-[40px]
                    text-sm
                  "
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </Button>
                <Button
                  onClick={handleConnectAgain}
                  disabled={isRemoving}
                  className="
                    flex-1 sm:flex-none
                    min-h-[44px] sm:min-h-[40px]
                    text-sm
                  "
                >
                  Connect Again
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div 
              className="
                p-3 sm:p-4 
                border border-red-200 dark:border-red-800 
                rounded-lg 
                bg-red-50 dark:bg-red-900/20
                text-red-700 dark:text-red-400
                text-sm
              "
              role="alert"
            >
              <p className="font-medium mb-1">Error</p>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Chat Window - Full Height on Mobile */}
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
              maxHeight: "calc(100% - 120px)", /* Adjusted to account for input bar outside */
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
        </div>
      </section>

      {/* Voice visualizer - shown when listening */}
      {listening && (
        <div className="py-3 md:py-4 px-4 sm:px-6 md:px-8 fixed bottom-[100px] left-0 right-0 z-20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-lg">
          <VoiceVisualizer 
            stream={stream} 
            listening={listening} 
          />
        </div>
      )}

      {/* Input bar - sticky bottom with safe area support */}
      <div
        className="
          fixed 
          bottom-0 
          left-0 
          right-0
          z-10
          bg-background/80 
          backdrop-blur-md 
          supports-[backdrop-filter]:backdrop-blur-lg
          border-t border-border/40
          pt-3 sm:pt-4
          px-4 sm:px-6 md:px-8
        "
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
        }}
      >
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
                  handleSend()
                }
              }}
              aria-label="Message input"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity glow-brand"
                aria-label="Send message"
                title="Send"
              >
                <ArrowIcon />
              </button>

              <button
                type="button"
                onClick={startListening}
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
      </div>

      {/* Database Connection Modal - Mobile Optimized */}
      <DatabaseConnectionModal
        isOpen={isModalOpen && !isConnected}
        onClose={() => {
          // Prevent closing if no file is connected
          if (isConnected) {
            setIsModalOpen(false)
          }
        }}
        onConnect={handleConnect}
      />
    </main>
  )
}
