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
  const [isFileCardExpanded, setIsFileCardExpanded] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Hynox. Ask me anything, or tap the mic and speak. I'll reply here.",
    },
  ])
  const [listening, setListening] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const recognitionRef = useRef<any>(null)
  const interimTranscriptRef = useRef<string>("")

  // Dynamic viewport height fix for mobile browsers
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
    if (!listening && !isSending) inputRef.current?.focus()
  }, [listening, isSending])

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, content }])
  }, [])

  const speakText = useCallback((text: string) => {
    try {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()
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

    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(media)
    } catch (error) {
      console.warn("Microphone access denied or unavailable:", error)
    }

    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
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

        if (!isConnected) {
          setIsModalOpen(true)
          addMessage("assistant", "Please connect a database to submit your query.")
          stopListening()
          return
        }
        
        console.log("Chat Context:", userText, "File URL:", fileUrl)
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

      localStorage.removeItem("hynox_excel_file_url")
      localStorage.removeItem("hynox_excel_file_name")
      
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
    if (!v || isSending) return

    if (!isConnected) {
      setIsModalOpen(true)
      addMessage("assistant", "Please connect a database to submit your query.")
      return
    }
    
    setIsSending(true)
    addMessage("user", v)
    console.log("Chat Context:", v, "File URL:", fileUrl)
    setText("")
    
    setTimeout(() => {
      addMessage("assistant", `Got it: "${v}". How can I help further?`)
      speakText(`Got it: ${v}. This is a sample response.`)
      setIsSending(false)
    }, 500)
  }

  return (
    <main 
      className="
        min-h-screen 
        flex flex-col
        bg-gradient-to-br from-slate-50 via-white to-blue-50
        dark:from-slate-950 dark:via-slate-900 dark:to-blue-950
        transition-colors duration-500
      "
      style={{
        minHeight: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating File Card Widget - Bottom Right */}
      {isConnected && fileUrl && fileName && (
        <>
          {/* Mobile: Collapsed FAB */}
          <div
            className="
              fixed 
              bottom-[160px] 
              right-4 
              z-30
              md:hidden
            "
          >
            {!isFileCardExpanded ? (
              <button
                onClick={() => setIsFileCardExpanded(true)}
                className="
                  w-14 h-14
                  flex items-center justify-center
                  rounded-2xl
                  backdrop-blur-xl
                  bg-gradient-to-br from-green-400 to-emerald-500
                  border border-white/30 dark:border-emerald-400/30
                  text-white
                  transition-all duration-300
                  hover:scale-110
                  active:scale-95
                  animate-in fade-in zoom-in-95 duration-500
                "
              >
                <ExcelIcon size={28} className="drop-shadow-md" />
              </button>
            ) : (
              <div
                className="
                  w-[280px]
                  backdrop-blur-xl
                  bg-white/80 dark:bg-slate-900/80
                  border border-white/30 dark:border-slate-700/30
                  rounded-2xl
                  p-4
                  animate-in fade-in slide-in-from-right-4 duration-300
                "
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="
                        flex-shrink-0 
                        w-10 h-10
                        flex items-center justify-center
                        rounded-xl
                        bg-gradient-to-br from-green-400 to-emerald-500
                        transition-all duration-300
                      "
                    >
                      <ExcelIcon className="text-white drop-shadow-md" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Connected
                      </p>
                      <p 
                        className="text-xs font-bold text-slate-900 dark:text-white truncate"
                        title={fileName}
                      >
                        {fileName.length > 20 ? `${fileName.slice(0, 20)}...` : fileName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFileCardExpanded(false)}
                    className="
                      text-slate-400 hover:text-slate-600 
                      dark:text-slate-500 dark:hover:text-slate-300
                      transition-colors duration-200
                    "
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRemoveConnection}
                    disabled={isRemoving}
                    size="sm"
                    className="
                      flex-1
                      text-xs
                      backdrop-blur-sm
                      bg-white/50 dark:bg-slate-800/50
                      border-slate-200 dark:border-slate-700
                      hover:bg-red-50 dark:hover:bg-red-950/30
                      hover:border-red-300 dark:hover:border-red-800
                      hover:text-red-600 dark:hover:text-red-400
                      transition-all duration-300
                    "
                  >
                    {isRemoving ? "..." : "Remove"}
                  </Button>
                  <Button
                    onClick={handleConnectAgain}
                    disabled={isRemoving}
                    size="sm"
                    className="
                      flex-1
                      text-xs
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      hover:from-blue-600 hover:to-indigo-700
                      text-white
                      transition-all duration-300
                    "
                  >
                    Switch
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Sidebar Widget */}
          <div
            className="
              hidden md:block
              fixed 
              top-24
              right-6
              z-30
              w-[320px]
              backdrop-blur-xl
              bg-white/70 dark:bg-slate-900/70
              border border-white/30 dark:border-slate-700/30
              rounded-3xl
              p-5
              transition-all duration-500
              hover:scale-[1.02]
              animate-in fade-in slide-in-from-right-4 duration-700
            "
          >
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="
                  flex-shrink-0 
                  w-14 h-14
                  flex items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br from-green-400 to-emerald-500
                  transition-all duration-300
                  hover:scale-110 hover:rotate-6
                "
              >
                <ExcelIcon className="text-white drop-shadow-md" size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Connected File
                </p>
                <p 
                  className="
                    text-sm font-bold 
                    text-slate-900 dark:text-white
                    break-words
                  "
                  title={fileName}
                >
                  {fileName}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleRemoveConnection}
                disabled={isRemoving}
                className="
                  w-full
                  text-sm font-semibold
                  backdrop-blur-sm
                  bg-white/50 dark:bg-slate-800/50
                  border-slate-200 dark:border-slate-700
                  hover:bg-red-50 dark:hover:bg-red-950/30
                  hover:border-red-300 dark:hover:border-red-800
                  hover:text-red-600 dark:hover:text-red-400
                  transition-all duration-300
                  hover:scale-105
                "
              >
                {isRemoving ? "Removing..." : "Remove Connection"}
              </Button>
              <Button
                onClick={handleConnectAgain}
                disabled={isRemoving}
                className="
                  w-full
                  text-sm font-semibold
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  text-white
                  transition-all duration-300
                  hover:scale-105
                "
              >
                Connect New File
              </Button>
            </div>
          </div>
        </>
      )}

      <section className="flex-1 flex items-stretch pb-[140px] relative z-10">
        <div 
          className="
            mx-auto 
            w-full 
            max-w-5xl 
            px-4 sm:px-6 md:px-8
            py-6 sm:py-8 md:py-10
            flex flex-col 
            gap-4 sm:gap-5
          "
        >
          {/* Error Alert */}
          {error && (
            <div 
              className="
                p-4 sm:p-5
                backdrop-blur-xl
                bg-red-50/90 dark:bg-red-950/50
                border border-red-200 dark:border-red-800/50
                rounded-2xl
                animate-in fade-in slide-in-from-top-2 duration-500
              "
              role="alert"
            >
              <p className="font-bold text-red-800 dark:text-red-300 mb-2 text-sm sm:text-base">
                Error Occurred
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Chat Window */}
          <div 
            ref={scrollRef}
            className="
              flex-1 
              overflow-y-auto 
              overflow-x-hidden
              px-4 sm:px-6 md:px-8
              py-6 sm:py-8
              rounded-3xl md:rounded-[2rem]
              backdrop-blur-2xl
              bg-white/40 dark:bg-slate-900/40
              border border-white/30 dark:border-slate-700/30
              overscroll-behavior-contain
              -webkit-overflow-scrolling-touch
              transition-all duration-500
              animate-in fade-in zoom-in-95 duration-700 delay-100
            "
            style={{
              minHeight: "60vh",
              maxHeight: "calc(100% - 140px)",
            }}
          >
            <div 
              className="
                mx-auto 
                w-full 
                max-w-3xl 
                py-3 md:py-4
                flex flex-col 
                gap-4 md:gap-5
              "
            >
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <MessageBubble 
                    message={m} 
                    onSpeak={speakText} 
                  />
                </div>
              ))}
              
              {isSending && (
                <div className="flex items-center gap-2 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">Hynox is thinking...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Voice Visualizer */}
      {listening && (
        <div 
          className="
            py-4 md:py-5 
            px-4 sm:px-6 md:px-8 
            fixed bottom-[120px] 
            left-0 right-0 
            z-30
            backdrop-blur-2xl
            bg-gradient-to-r from-white/80 via-blue-50/80 to-white/80
            dark:from-slate-900/80 dark:via-blue-950/80 dark:to-slate-900/80
            border-t border-b border-white/40 dark:border-slate-700/40
            animate-in fade-in slide-in-from-bottom-4 duration-500
          "
        >
          <VoiceVisualizer 
            stream={stream} 
            listening={listening} 
          />
        </div>
      )}

      {/* Input Bar */}
      <div
        className="
          fixed 
          bottom-0 
          left-0 
          right-0
          z-20
          backdrop-blur-2xl
          bg-white/80 dark:bg-slate-900/80
          border-t border-white/40 dark:border-slate-700/40
          pt-4 sm:pt-5
          px-4 sm:px-6 md:px-8
          transition-all duration-300
        "
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`,
        }}
      >
        <div className="w-full max-w-4xl mx-auto">
          <div 
            className="
              flex items-center gap-3
              rounded-3xl
              backdrop-blur-xl
              bg-white/90 dark:bg-slate-800/90
              border border-slate-200/50 dark:border-slate-700/50
              p-2.5 sm:p-3
              ring-1 ring-inset ring-slate-200/20 dark:ring-slate-700/20
              transition-all duration-300
              hover:border-blue-300/50 dark:hover:border-blue-700/50
              focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-400/20
              focus-within:border-blue-400 dark:focus-within:border-blue-600
              focus-within:scale-[1.01]
            "
          >
            <input
              ref={inputRef}
              className={cn(
                "flex-1 bg-transparent px-4 py-3 text-sm sm:text-base outline-none",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "text-slate-900 dark:text-white",
                "transition-all duration-200"
              )}
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
              disabled={isSending || listening}
              aria-label="Message input"
            />

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || isSending || listening}
                className="
                  inline-flex items-center justify-center
                  rounded-2xl
                  px-5 py-3
                  text-sm font-semibold
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                  hover:scale-105
                  active:scale-95
                "
                aria-label="Send message"
                title="Send"
              >
                <ArrowIcon />
              </button>

              <button
                type="button"
                onClick={startListening}
                disabled={isSending}
                className={cn(
                  "size-12 sm:size-11 rounded-2xl flex items-center justify-center",
                  "transition-all duration-300",
                  "hover:scale-105 active:scale-95",
                  listening
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white animate-pulse"
                    : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-700"
                )}
                aria-label={listening ? "Stop listening" : "Start listening"}
                title={listening ? "Stop listening" : "Start listening"}
              >
                <MicIcon size={22} />
              </button>
            </div>
          </div>
          
          <p className="mt-3 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium transition-all duration-300">
            Press <kbd className="px-2 py-1 mx-1 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-xs">Enter</kbd> to send • Tap mic to speak
          </p>
        </div>
      </div>

      <DatabaseConnectionModal
        isOpen={isModalOpen && !isConnected}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromTop {
          from { 
            opacity: 0;
            transform: translateY(-16px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromBottom {
          from { 
            opacity: 0;
            transform: translateY(16px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromRight {
          from { 
            opacity: 0;
            transform: translateX(16px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes zoomIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fadeIn;
        }
        
        .slide-in-from-top-4 {
          animation-name: slideInFromTop;
        }
        
        .slide-in-from-top-2 {
          animation-name: slideInFromTop;
          animation-duration: 0.3s;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slideInFromBottom;
        }
        
        .slide-in-from-bottom-3 {
          animation-name: slideInFromBottom;
          animation-duration: 0.5s;
        }
        
        .slide-in-from-bottom-2 {
          animation-name: slideInFromBottom;
          animation-duration: 0.3s;
        }

        .slide-in-from-right-4 {
          animation-name: slideInFromRight;
        }
        
        .zoom-in-95 {
          animation-name: zoomIn;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
        
        .duration-500 {
          animation-duration: 500ms;
        }
        
        .duration-700 {
          animation-duration: 700ms;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 9999px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.4);
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.6);
        }
      `}</style>
    </main>
  )
}
