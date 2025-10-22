"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (fileUrl: string) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function DatabaseConnectionModal({
  isOpen,
  onClose,
  onConnect,
}: DatabaseConnectionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["xlsx", "xls", "csv"];

    if (!validExtensions.includes(fileExtension || "")) {
      return "Please upload a valid Excel file (.xlsx, .xls, or .csv)";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files[0]);
    } else {
      setSelectedFile(null);
      setError(null);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an Excel file to upload.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const fileName = selectedFile.name;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { data, error: uploadError } = await supabase.storage
        .from("file-storage")
        .upload(`excel-uploads/${fileName}`, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("file-storage")
        .getPublicUrl(`excel-uploads/${fileName}`);

      if (publicUrlData && publicUrlData.publicUrl) {
        localStorage.setItem("hynox_excel_file_url", publicUrlData.publicUrl);
        localStorage.setItem("hynox_excel_file_name", fileName);

        setTimeout(() => {
          onConnect(publicUrlData.publicUrl);
          onClose();
          resetModal();
        }, 500);
      } else {
        throw new Error("Could not get public URL for the uploaded file.");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error.message);
      setError(`Upload failed: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="
          w-[calc(100vw-2rem)] max-w-lg
          p-0
          gap-0
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl
          shadow-2xl
          max-h-[90vh] sm:max-h-[85vh]
          flex flex-col
        "
      >
        {/* Header - Fixed */}
        <DialogHeader className="
          px-4 sm:px-6 
          pt-5 sm:pt-6 
          pb-4 sm:pb-5
          border-b border-slate-200 dark:border-slate-800
          flex-shrink-0
        ">
          <DialogTitle className="
            text-xl sm:text-2xl 
            font-bold 
            text-slate-900 dark:text-white
            mb-1.5 sm:mb-2
          ">
            Connect Your Data
          </DialogTitle>
          <DialogDescription className="
            text-sm sm:text-base 
            text-slate-600 dark:text-slate-400
            leading-relaxed
          ">
            Upload an Excel file to start analyzing your data
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="
          flex-1 
          overflow-y-auto 
          px-4 sm:px-6 
          py-4 sm:py-5
          overscroll-behavior-contain
        ">
          {/* File Type Info Banner */}
          <div className="
            mb-4
            p-3 sm:p-3.5
            rounded-lg
            bg-blue-50 dark:bg-blue-950/30
            border border-blue-200 dark:border-blue-800/50
          ">
            <div className="flex items-start gap-2.5">
              <svg 
                className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Supported Formats
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  .xlsx, .xls, .csv • Max 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={cn(
              "relative",
              "rounded-xl sm:rounded-2xl",
              "border-2 border-dashed",
              "transition-all duration-300",
              "cursor-pointer",
              "touch-manipulation", // Better mobile interaction
              isDragging
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]"
                : selectedFile
                ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30"
                : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 active:bg-slate-100 dark:active:bg-slate-800/50"
            )}
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
              <div className="
                flex flex-col items-center 
                px-4 sm:px-6 
                py-8 sm:py-10 
                text-center
              ">
                {/* Upload Icon */}
                <div
                  className={cn(
                    "size-14 sm:size-16",
                    "rounded-xl sm:rounded-2xl",
                    "flex items-center justify-center",
                    "mb-4",
                    "transition-all duration-300",
                    isDragging
                      ? "bg-blue-500 scale-110"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  )}
                >
                  <svg
                    className="size-7 sm:size-8 text-white"
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

                {/* Text Content */}
                <div>
                  <p className="
                    text-base sm:text-lg 
                    font-semibold 
                    text-slate-900 dark:text-white 
                    mb-1.5 sm:mb-2
                  ">
                    {isDragging ? "Drop file here" : "Choose a file"}
                  </p>
                  <p className="
                    text-sm sm:text-base 
                    text-slate-600 dark:text-slate-400 
                    mb-3
                  ">
                    Drag & drop or tap to browse
                  </p>
                  
                  {/* Mobile-Friendly Button */}
                  <button
                    type="button"
                    className="
                      inline-flex items-center gap-2
                      px-4 sm:px-5 
                      py-2 sm:py-2.5
                      rounded-lg
                      bg-slate-200 dark:bg-slate-800
                      hover:bg-slate-300 dark:hover:bg-slate-700
                      text-sm font-medium
                      text-slate-700 dark:text-slate-300
                      transition-colors duration-200
                      touch-manipulation
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowseClick();
                    }}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="
                px-4 sm:px-6 
                py-6 sm:py-8
              ">
                {/* File Selected State */}
                <div className="flex flex-col items-center text-center">
                  {/* Success Icon */}
                  <div className="
                    size-14 sm:size-16 
                    rounded-xl sm:rounded-2xl 
                    bg-gradient-to-br from-green-500 to-emerald-600
                    flex items-center justify-center 
                    mb-4
                    animate-in zoom-in-95 duration-300
                  ">
                    <svg
                      className="size-7 sm:size-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* File Info */}
                  <p className="
                    text-sm sm:text-base 
                    font-semibold 
                    text-slate-900 dark:text-white 
                    mb-1
                    break-all
                    px-2
                  ">
                    {selectedFile.name}
                  </p>
                  <p className="
                    text-xs sm:text-sm 
                    text-slate-500 dark:text-slate-400
                    mb-4
                  ">
                    {formatFileSize(selectedFile.size)}
                  </p>

                  {/* Progress Bar */}
                  {loading && (
                    <div className="w-full mb-4 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Uploading...
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="
                        w-full h-2 sm:h-2.5
                        bg-slate-200 dark:bg-slate-700 
                        rounded-full 
                        overflow-hidden
                      ">
                        <div
                          className="
                            h-full 
                            bg-gradient-to-r from-blue-500 to-indigo-600 
                            transition-all duration-300 ease-out
                            rounded-full
                          "
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!loading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetModal();
                      }}
                      className="
                        inline-flex items-center gap-2
                        px-4 py-2
                        rounded-lg
                        text-sm font-medium
                        text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-950/30
                        transition-colors duration-200
                        touch-manipulation
                      "
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove File
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="
                mt-4
                p-3 sm:p-3.5
                rounded-lg
                bg-red-50 dark:bg-red-950/30
                border border-red-200 dark:border-red-800/50
                animate-in fade-in slide-in-from-top-2 duration-300
              "
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <svg
                  className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 flex-1">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <DialogFooter className="
          px-4 sm:px-6 
          py-4 sm:py-5
          border-t border-slate-200 dark:border-slate-800
          flex-shrink-0
          gap-2 sm:gap-3
          flex-row
          justify-end
        ">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="
              flex-1 sm:flex-none
              min-w-[100px]
              h-10 sm:h-11
              text-sm sm:text-base
              touch-manipulation
            "
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="
              flex-1 sm:flex-none
              min-w-[120px]
              h-10 sm:h-11
              text-sm sm:text-base
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              disabled:opacity-50
              touch-manipulation
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin size-4" viewBox="0 0 24 24">
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
                <span className="hidden xs:inline">Uploading...</span>
                <span className="xs:hidden">{uploadProgress}%</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Upload & Connect</span>
                <span className="sm:hidden">Upload</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}