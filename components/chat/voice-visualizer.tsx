"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function VoiceVisualizer({ 
  stream, 
  listening 
}: { 
  stream: MediaStream | null
  listening: boolean 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  useEffect(() => {
    if (!isMounted || !listening || !stream) {
      // Clean up visualization
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      return
    }

    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    // Create analyzer with optimized settings
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 128 // Smaller for minimalist look
      analyserRef.current.smoothingTimeConstant = 0.8 // Smoother transitions
    }

    // Connect audio source
    if (sourceRef.current) sourceRef.current.disconnect()
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
    sourceRef.current.connect(analyserRef.current)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const barCount = 32 // Fixed number of bars for clean look

    const draw = () => {
      if (!listening || !isMounted) return

      animationFrameId.current = requestAnimationFrame(draw)
      analyserRef.current!.getByteFrequencyData(dataArray)

      // Clear with fade effect
      ctx.fillStyle = "rgba(17, 17, 17, 0.3)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / barCount
      const gap = 2

      for (let i = 0; i < barCount; i++) {
        // Sample frequency data evenly across spectrum
        const dataIndex = Math.floor((i * bufferLength) / barCount)
        const value = dataArray[dataIndex] || 0
        
        // Normalize and scale
        const barHeight = (value / 255) * canvas.height * 0.9
        const x = i * barWidth
        const y = canvas.height - barHeight

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, canvas.height, x, y)
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)") // Indigo base
        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.9)") // Purple mid
        gradient.addColorStop(1, "rgba(196, 181, 253, 1)") // Light purple top

        // Draw rounded bars
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(
          x + gap / 2, 
          y, 
          barWidth - gap, 
          barHeight,
          [4, 4, 0, 0] // Rounded top corners only
        )
        ctx.fill()
      }
    }

    draw()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
    }
  }, [listening, stream, isMounted])

  return (
    <div
      className={cn(
        "relative w-full h-20 rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "border border-slate-700/50",
        "shadow-lg shadow-indigo-500/10",
        "transition-all duration-500 ease-out",
        listening 
          ? "opacity-100 scale-100 shadow-indigo-500/30" 
          : "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent" />
      
      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        width="600" 
        height="80" 
        className="relative z-10 w-full h-full"
      />
      
      {/* Listening indicator */}
      {listening && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="text-xs font-medium text-slate-300 tracking-wide">LISTENING</span>
        </div>
      )}
    </div>
  )
}