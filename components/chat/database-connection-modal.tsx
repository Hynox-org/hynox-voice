"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an Excel file to upload.")
      return
    }

    setLoading(true)
    try {
      const fileExtension = selectedFile.name.split(".").pop()
      if (fileExtension !== "xlsx" && fileExtension !== "xls" && fileExtension !== "csv") {
        alert("Please upload a valid Excel file (.xlsx or .xls).")
        setLoading(false)
        return
      }

      const fileName = selectedFile.name
      const { data, error } = await supabase.storage
        .from("file-storage")
        .upload(`excel-uploads/${fileName}`, selectedFile, { // Use 'file-storage' bucket and 'excel-uploads' folder
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from("file-storage")
        .getPublicUrl(`excel-uploads/${fileName}`)

      if (publicUrlData && publicUrlData.publicUrl) {
        localStorage.setItem("hynox_excel_file_url", publicUrlData.publicUrl)
        onConnect(publicUrlData.publicUrl)
        onClose()
      } else {
        throw new Error("Could not get public URL for the uploaded file.")
      }
    } catch (error: any) {
      console.error("Error uploading file:", error.message)
      alert(`Error uploading file: ${error.message}`)
    } finally {
      setLoading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Database</DialogTitle>
          <DialogDescription>
            Connect your data source to Hynox. Currently, only Excel file uploads are supported.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="excel-file" className="text-right">
              Excel File
            </Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              className="col-span-3"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || loading}>
            {loading ? "Uploading..." : "Upload & Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
