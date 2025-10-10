"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    const storedFileUrl = localStorage.getItem("hynox_excel_file_url")
    if (storedFileUrl) {
      setIsConnected(true)
      setFileUrl(storedFileUrl)
      const name = storedFileUrl.split("/").pop()?.split("?")[0]
      setFileName(name ? decodeURIComponent(name) : null)
    } else {
      setIsModalOpen(true)
    }
  }, [])

  const handleConnect = (url: string) => {
    setFileUrl(url)
    setIsConnected(true)
    const name = url.split("/").pop()?.split("?")[0]
    setFileName(name ? decodeURIComponent(name) : null)
  }

  const handleRemoveConnection = async () => {
    if (fileUrl) {
      try {
        const filePath = `excel-uploads/${fileName}`
        const { error } = await supabase.storage.from("file-storage").remove([filePath])

        if (error) {
          throw error
        }

        localStorage.removeItem("hynox_excel_file_url")
        setIsConnected(false)
        setFileUrl(null)
        setFileName(null)
        setIsModalOpen(true) // Open modal to connect again
      } catch (error: any) {
        console.error("Error removing file from Supabase:", error.message)
        alert(`Error removing file: ${error.message}`)
      }
    }
  }

  const handleConnectAgain = async () => {
    await handleRemoveConnection()
    setIsModalOpen(true)
    setIsConnected(false)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex items-stretch">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8 flex flex-col gap-4">
          {isConnected && fileUrl && fileName ? (
            <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <ExcelIcon className="text-green-600" size={30} />
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Connected: {fileName}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRemoveConnection}>
                  Remove
                </Button>
                <Button onClick={handleConnectAgain}>
                  Connect Again
                </Button>
              </div>
            </div>
          ) : null}
          <ChatWindow fileUrl={fileUrl} />
        </div>
      </section>
      <DatabaseConnectionModal
        isOpen={isModalOpen && !isConnected}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </main>
  )
}
