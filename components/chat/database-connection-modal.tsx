"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { createClient } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface DatabaseConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (fileUrl: string) => void
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function DatabaseConnectionModal({ isOpen, onClose, onConnect }: DatabaseConnectionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const validExtensions = ["xlsx", "xls", "csv"]
    
    if (!validExtensions.includes(fileExtension || "")) {
      return "Please upload a valid Excel file (.xlsx, .xls, or .csv)"
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB"
    }
    
    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }
    
    setError(null)
    setSelectedFile(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files[0])
    } else {
      setSelectedFile(null)
      setError(null)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an Excel file to upload.")
      return
    }

    setLoading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const fileName = selectedFile.name
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const { data, error: uploadError } = await supabase.storage
        .from("file-storage")
        .upload(`excel-uploads/${fileName}`, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from("file-storage")
        .getPublicUrl(`excel-uploads/${fileName}`)

      if (publicUrlData && publicUrlData.publicUrl) {
        localStorage.setItem("hynox_excel_file_url", publicUrlData.publicUrl)
        localStorage.setItem("hynox_excel_file_name", fileName)
        
        setTimeout(() => {
          onConnect(publicUrlData.publicUrl)
          onClose()
          resetModal()
        }, 500)
      } else {
        throw new Error("Could not get public URL for the uploaded file.")
      }
    } catch (error: any) {
      console.error("Error uploading file:", error.message)
      setError(`Upload failed: ${error.message}`)
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setSelectedFile(null)
    setError(null)
    setUploadProgress(0)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Connect Your Data
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base">
            Upload an Excel file (.xlsx, .xls, .csv) to connect with Hynox AI
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative",
              "rounded-2xl",
              "border-2 border-dashed",
              "transition-all duration-300",
              "min-h-[240px]",
              "flex flex-col items-center justify-center",
              "cursor-pointer",
              "backdrop-blur-sm",
              isDragging
                ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]"
                : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
            )}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

            {!selectedFile ? (
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isDragging 
                    ? "bg-blue-500 dark:bg-blue-600 scale-110" 
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {isDragging ? "Drop your file here" : "Drag & drop your file"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    or click to browse
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Supported formats: .xlsx, .xls, .csv (Max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-8 w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-in zoom-in-95 duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="text-center w-full">
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-1 truncate px-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatFileSize(selectedFile.size)}
                  </p>

                  {loading && (
                    <div className="mt-4 w-full max-w-xs mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Uploading...
                        </span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!loading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetModal()
                      }}
                      className="mt-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Remove file
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="
                mt-4 p-3 
                rounded-xl 
                bg-red-50 dark:bg-red-950/30 
                border border-red-200 dark:border-red-800/50
                animate-in fade-in slide-in-from-top-2 duration-300
              "
            >
              <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="
              flex-1 sm:flex-none
              backdrop-blur-sm
              bg-white/50 dark:bg-slate-800/50
              border-slate-200 dark:border-slate-700
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-300
            "
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="
              flex-1 sm:flex-none
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              text-white font-semibold
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-all duration-300
              hover:scale-105
              active:scale-95
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload & Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}