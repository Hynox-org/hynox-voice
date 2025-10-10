"use client"

import { useEffect, useRef } from "react"

export function VoiceVisualizer({
  stream,
  listening,
}: {
  stream: MediaStream | null
  listening: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    if (!listening || !stream) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      return
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioCtx()
    audioCtxRef.current = audioCtx

    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      analyser.getByteFrequencyData(dataArray)

      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      const barCount = 48
      const step = Math.floor(bufferLength / barCount)
      const barWidth = (width / barCount) * 0.6
      const gap = (width / barCount) * 0.4

      for (let i = 0; i < barCount; i++) {
        const v = dataArray[i * step] / 255
        const barHeight = Math.max(4, v * height)
        const x = i * (barWidth + gap)
        const y = height - barHeight

        // Cyan/blue gradient bars using tokens
        ctx.fillStyle =
          getComputedStyle(document.documentElement).getPropertyValue("--brand-bars") || "rgba(0, 212, 255, 0.8)"
        ctx.fillRect(x, y, barWidth, barHeight)
      }
    }

    render()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      try {
        audioCtxRef.current?.close()
      } catch {}
    }
  }, [listening, stream])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl rounded-xl border border-border/60 bg-background/40 px-2 py-2 glow-muted">
        <canvas
          ref={canvasRef}
          className="block w-full h-16 sm:h-20"
          width={800}
          height={120}
          aria-label="Voice visualizer"
        />
      </div>
    </div>
  )
}
