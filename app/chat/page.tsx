"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DatabaseConnectionModal } from "@/components/chat/database-connection-modal";
import { MessageBubble } from "@/components/chat/message-bubble";
import { VoiceVisualizer } from "@/components/chat/voice-visualizer";
import { ResponseCard, ApiResponse } from "@/components/chat/response-card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ExcelIcon,
  ArrowIcon,
  MicIcon,
  AttachmentIcon,
} from "@/components/icons";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ApiResponse;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm Hynox. Ask me anything, or tap the mic and speak. I'll reply here.",
    },
  ]);
  const [listening, setListening] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef<string>("");

  // Dynamic viewport height fix for mobile browsers
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const storedFileUrl = localStorage.getItem("hynox_excel_file_url");
    const storedFileName = localStorage.getItem("hynox_excel_file_name");

    if (storedFileUrl) {
      setIsConnected(true);
      setFileUrl(storedFileUrl);

      if (storedFileName) {
        setFileName(storedFileName);
      } else {
        const name = storedFileUrl.split("/").pop()?.split("?")[0];
        setFileName(name ? decodeURIComponent(name) : null);
      }
    } else {
      setIsModalOpen(true);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollBehavior = messages.length > 2 ? "smooth" : "auto";
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: scrollBehavior,
      });
    }
  }, [messages]);

  // Focus input bar when not listening
  useEffect(() => {
    if (!listening && !isSending) inputRef.current?.focus();
  }, [listening, isSending]);

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string, response?: ApiResponse) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role, content, response },
      ]);
    },
    []
  );

  const speakText = useCallback((text: string) => {
    try {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        speechSynthesis.speak(utter);
      }
    } catch (error) {
      console.warn("Speech synthesis not supported:", error);
    }
  }, []);

  const stopListening = useCallback(async () => {
    setListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("Error stopping recognition:", error);
      }
      recognitionRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startListening = useCallback(async () => {
    if (listening) {
      await stopListening();
      return;
    }

    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(media);
    } catch (error) {
      console.warn("Microphone access denied or unavailable:", error);
    }

    const SpeechRecognition: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setListening(true);
      setTimeout(() => {
        setListening(false);
        addMessage(
          "assistant",
          "Speech recognition is not supported on this browser. Please type your message instead."
        );
      }, 1500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    interimTranscriptRef.current = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      interimTranscriptRef.current = (finalText || interim).trim();
    };

    recognition.onend = async () => {
      const userText = interimTranscriptRef.current.trim();

      if (userText) {
        setIsSending(true);
        addMessage("user", userText);

        if (!isConnected) {
          setIsModalOpen(true);
          addMessage(
            "assistant",
            "Please connect a database to submit your query."
          );
          stopListening();
          setIsSending(false);
          return;
        }

        stopListening();
        const data: ApiResponse = await getChatApiResponse(userText, fileUrl!);
        addMessage("assistant", data.summary, data);
        speakText(data.summary);
      } else {
        addMessage("assistant", "No speech detected. Please try again.");
      }
      setIsSending(false);
      stopListening();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "no-speech") {
        addMessage("assistant", "No speech detected. Please try again.");
      } else if (event.error === "network") {
        addMessage("assistant", "Network error. Please check your connection.");
      }

      stopListening();
    };

    recognitionRef.current = recognition;
    setListening(true);

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      stopListening();
    }
  }, [addMessage, listening, stopListening, speakText, isConnected, fileUrl]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, [stream]);

  const handleConnect = useCallback((url: string) => {
    const name = url.split("/").pop()?.split("?")[0];
    const decodedName = name ? decodeURIComponent(name) : null;

    setFileUrl(url);
    setIsConnected(true);
    setFileName(decodedName);
    setError(null);

    localStorage.setItem("hynox_excel_file_url", url);
    if (decodedName) {
      localStorage.setItem("hynox_excel_file_name", decodedName);
    }
  }, []);

  const handleRemoveConnection = useCallback(async () => {
    if (!fileUrl || !fileName) return;

    setIsRemoving(true);
    setError(null);

    try {
      const filePath = `excel-uploads/${fileName}`;
      const { error: storageError } = await supabase.storage
        .from("file-storage")
        .remove([filePath]);

      if (storageError) {
        throw storageError;
      }

      localStorage.removeItem("hynox_excel_file_url");
      localStorage.removeItem("hynox_excel_file_name");

      setIsConnected(false);
      setFileUrl(null);
      setFileName(null);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("Error removing file from Supabase:", error.message);
      setError(`Failed to remove file: ${error.message}`);
    } finally {
      setIsRemoving(false);
    }
  }, [fileUrl, fileName]);

  const handleConnectAgain = useCallback(async () => {
    await handleRemoveConnection();
  }, [handleRemoveConnection]);

  const getChatApiResponse = async (v: string, fileUrl: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_API_URL}/backend`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_context: v,
          file_url: fileUrl,
        }),
      }
    );

    return response.json();
  };

  const handleSend = async () => {
    const v = text.trim();
    if (!v || isSending) return;

    if (!isConnected) {
      setIsModalOpen(true);
      addMessage(
        "assistant",
        "Please connect a database to submit your query."
      );
      return;
    }

    setIsSending(true);
    addMessage("user", v);
    setText("");

    try {
      const data: ApiResponse = await getChatApiResponse(v, fileUrl!);
      addMessage("assistant", data.summary, data);
      speakText(data.summary);
    } catch (error) {
      console.error("Error sending data to Flask:", error);
      addMessage(
        "assistant",
        "Sorry, something went wrong. Please try again.",
        {
          status: "error",
          summary: "Failed to fetch response from the backend.",
          data: null,
          table: null,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        }
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main
      className="
        h-screen 
        flex flex-col
        bg-slate-50 dark:bg-slate-950
        transition-colors duration-300
      "
      style={{
        height: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      {/* Minimalist Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      <header className="
  relative z-30
  border-b border-slate-200/80 dark:border-slate-800/80
  bg-white/95 dark:bg-slate-900/95
  backdrop-blur-xl
  px-4 sm:px-6 lg:px-8
  py-3 sm:py-4
  transition-all duration-300
">
  <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
    {/* Active Connection Info */}
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {isConnected && fileName ? (
        <>
          <div className="
            size-9 sm:size-10
            rounded-lg
            bg-gradient-to-br from-green-500 to-emerald-600
            flex items-center justify-center
            flex-shrink-0
            shadow-lg shadow-green-500/25
          ">
            <ExcelIcon size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Connected to
            </p>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
              {fileName}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="
            size-9 sm:size-10
            rounded-lg
            bg-slate-100 dark:bg-slate-800
            flex items-center justify-center
            flex-shrink-0
          ">
            <AttachmentIcon size={20} className="text-slate-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No database
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Connect a file to start
            </button>
          </div>
        </>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      {isConnected && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="
                size-9 sm:size-10
                rounded-lg
                flex items-center justify-center
                text-slate-600 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-colors duration-200
              "
              aria-label="Manage connection"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Active Connection
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 break-words">
                  {fileName}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveConnection}
                    disabled={isRemoving}
                    className="w-full"
                  >
                    {isRemoving ? "Removing..." : "Disconnect"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConnectAgain}
                    disabled={isRemoving}
                    className="w-full"
                  >
                    Switch File
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  </div>
</header>

      {/* Error Toast - Redesigned */}
      {error && (
        <div
          className="
            fixed top-20 right-4 left-4 sm:left-auto sm:right-6
            sm:max-w-md
            z-50
            p-4
            backdrop-blur-xl
            bg-red-50/95 dark:bg-red-950/95
            border border-red-200 dark:border-red-800
            rounded-xl
            shadow-2xl shadow-red-500/20
            animate-in fade-in slide-in-from-top-4 duration-300
          "
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-red-900 dark:text-red-100 mb-1">
                Error Occurred
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Container - Redesigned with better spacing */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <div
          ref={scrollRef}
          className="
            h-full
            overflow-y-auto
            overflow-x-hidden
            overscroll-behavior-contain
            -webkit-overflow-scrolling-touch
          "
        >
          <div
            className={cn(
              "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8",
              listening
                ? "pb-[calc(184px+env(safe-area-inset-bottom))]"
                : "pb-[calc(124px+env(safe-area-inset-bottom))]"
            )}
          >
            <div className="space-y-4 sm:space-y-6">
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  className={cn(
                    "animate-in fade-in slide-in-from-bottom-2 duration-500",
                    "transition-all"
                  )}
                  style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                >
                  <MessageBubble message={m} onSpeak={speakText} />
                  {m.response && (
                    <div className="mt-3">
                      <ResponseCard response={m.response} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator - Redesigned */}
              {isSending && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="
                    size-8 sm:size-10
                    rounded-full
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    flex items-center justify-center
                    flex-shrink-0
                  ">
                    <span className="text-white font-bold text-xs sm:text-sm">H</span>
                  </div>
                  <div className="
                    mt-2
                    px-4 py-3
                    rounded-2xl rounded-tl-sm
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    shadow-sm
                  ">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Visualizer - Redesigned position */}
      {listening && (
        <div
          className="
            fixed bottom-24 sm:bottom-28
            left-0 right-0
            z-40
            px-4 sm:px-6 lg:px-8
            animate-in fade-in slide-in-from-bottom-4 duration-300
          "
        >
          <div className="
            max-w-2xl mx-auto
            p-4 sm:p-6
            backdrop-blur-2xl
            bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10
            dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/20
            border border-blue-200/50 dark:border-blue-700/50
            rounded-2xl
            shadow-2xl shadow-blue-500/20
          ">
            <VoiceVisualizer stream={stream} listening={listening} />
          </div>
        </div>
      )}

      {/* Input Bar - Completely Redesigned */}
      <div
        className="
          fixed 
          bottom-0 
          left-0 
          right-0
          z-30
          border-t border-slate-200/80 dark:border-slate-800/80
          bg-white/95 dark:bg-slate-900/95
          backdrop-blur-xl
        "
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          {/* Connection Status Banner - Mobile */}
          {isConnected && fileName && (
            <div className="
              md:hidden
              flex items-center gap-2
              px-3 py-2
              mb-3
              rounded-lg
              bg-green-50 dark:bg-green-950/30
              border border-green-200 dark:border-green-800/50
            ">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400 truncate flex-1">
                {fileName}
              </span>
            </div>
          )}

          {/* Input Container */}
          <div className="
            flex items-end gap-2 sm:gap-3
            p-2 sm:p-2.5
            rounded-2xl
            bg-slate-50 dark:bg-slate-800/50
            border border-slate-200 dark:border-slate-700
            transition-all duration-200
            focus-within:border-blue-400 dark:focus-within:border-blue-600
            focus-within:ring-2 focus-within:ring-blue-400/20 dark:focus-within:ring-blue-600/20
            hover:border-slate-300 dark:hover:border-slate-600
          ">
            {/* Attachment Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={listening || isSending}
              className={cn(
                "flex-shrink-0",
                "size-9 sm:size-10",
                "rounded-xl",
                "flex items-center justify-center",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isConnected
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              aria-label={isConnected ? "Connected file" : "Attach file"}
            >
              {isConnected ? <ExcelIcon size={20} /> : <AttachmentIcon size={20} />}
            </button>

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              <input
                ref={inputRef}
                className={cn(
                  "w-full",
                  "bg-transparent",
                  "px-2 py-2.5 sm:py-3",
                  "text-sm sm:text-base",
                  "text-slate-900 dark:text-white",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "outline-none",
                  "transition-all duration-200"
                )}
                type="text"
                placeholder={listening ? "Listening..." : "Type your message..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isSending || listening}
                aria-label="Message input"
              />
            </div>

            {/* Voice Button */}
            <button
              type="button"
              onClick={startListening}
              disabled={isSending}
              className={cn(
                "flex-shrink-0",
                "size-9 sm:size-10",
                "rounded-xl",
                "flex items-center justify-center",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                listening
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              aria-label={listening ? "Stop listening" : "Start voice input"}
            >
              <MicIcon size={20} />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || isSending || listening}
              className={cn(
                "flex-shrink-0",
                "size-9 sm:size-10",
                "rounded-xl",
                "flex items-center justify-center",
                "bg-gradient-to-r from-blue-500 to-indigo-600",
                "text-white",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                "hover:shadow-lg hover:shadow-blue-500/50",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              )}
              aria-label="Send message"
            >
              <ArrowIcon />
            </button>
          </div>

          {/* Helper Text */}
          <p className="
            mt-2 sm:mt-3
            text-center
            text-xs
            text-slate-500 dark:text-slate-400
          ">
            Press{" "}
            <kbd className="
              px-1.5 py-0.5 mx-0.5
              rounded
              bg-slate-200 dark:bg-slate-700
              text-slate-700 dark:text-slate-300
              font-mono text-[10px]
              border border-slate-300 dark:border-slate-600
            ">
              Enter
            </kbd>{" "}
            to send • Click mic to speak
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
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .slide-in-from-bottom-4 {
          animation-name: slideInFromBottom;
        }

        .slide-in-from-bottom-2 {
          animation-name: slideInFromBottom;
          animation-duration: 0.4s;
        }

        .duration-300 {
          animation-duration: 300ms;
        }

        .duration-400 {
          animation-duration: 400ms;
        }

        .duration-500 {
          animation-duration: 500ms;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }

        .dark ::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.4);
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.6);
        }

        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }

        .dark * {
          scrollbar-color: rgba(71, 85, 105, 0.4) transparent;
        }
      `}</style>
    </main>
  );
}
