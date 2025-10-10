"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatWindow } from "@/components/chat/chat-window"
import { DatabaseConnectionModal } from "@/components/chat/database-connection-modal"
import { Button } from "@/components/ui/button"
import { ExcelIcon } from "@/components/icons"
import { createClient } from "@supabase/supabase-js"

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
      <section className="flex-1 flex items-stretch">
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
          {/* Connection Status Card - Mobile Optimized */}
          {isConnected && fileUrl && fileName && (
            <div 
              className="
                flex flex-col sm:flex-row 
                sm:items-center sm:justify-between 
                gap-3 sm:gap-4
                p-3 sm:p-4 
                border rounded-lg sm:rounded-xl 
                shadow-sm 
                bg-white dark:bg-gray-800
                transition-all duration-200
              "
            >
              {/* File Info Section */}
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

              {/* Action Buttons - Mobile Responsive */}
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

          {/* Error Message - Mobile Optimized */}
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
            className="
              flex-1 
              w-full
              rounded-xl sm:rounded-2xl
              overflow-hidden
            "
            style={{
              minHeight: "calc(var(--vh, 1vh) * 60)",
            }}
          >
            <ChatWindow fileUrl={fileUrl} />
          </div>
        </div>
      </section>

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
