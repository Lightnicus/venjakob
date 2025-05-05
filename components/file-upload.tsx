"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, File, FileText, FileImage, FileIcon as FilePdf } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
  acceptedFileTypes?: string
  maxFileSize?: number // in MB
  multiple?: boolean
  disabled?: boolean
}

export function FileUpload({
  onFileUpload,
  acceptedFileTypes = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg",
  maxFileSize = 10, // 10MB default
  multiple = true,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase() || ""
    const isValidType = acceptedFileTypes.includes(fileType) || acceptedFileTypes.includes(`.${fileType}`)

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `File type .${fileType} is not supported.`,
        variant: "destructive",
      })
      return false
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size exceeds the maximum limit of ${maxFileSize}MB.`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const processFiles = (files: FileList | null) => {
    if (!files || disabled) return

    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (validateFile(file)) {
        validFiles.push(file)

        // Simulate upload progress
        simulateUploadProgress(file.name)
      }
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...uploadedFiles, ...validFiles] : validFiles
      setUploadedFiles(newFiles)
      onFileUpload(newFiles)
    }
  }

  const simulateUploadProgress = (fileName: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }

      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: progress,
      }))
    }, 200)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    processFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
    onFileUpload(newFiles)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "docx":
      case "doc":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "xlsx":
      case "xls":
        return <FileText className="h-5 w-5 text-green-500" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FileImage className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          accept={acceptedFileTypes}
          multiple={multiple}
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <h3 className="text-lg font-medium">Drag and drop files here</h3>
          <p className="text-sm text-gray-500">
            or <span className="text-primary font-medium">click to browse</span>
          </p>
          <p className="text-xs text-gray-400">Accepted file types: {acceptedFileTypes.replace(/\./g, "")}</p>
          <p className="text-xs text-gray-400">Maximum file size: {maxFileSize}MB</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-medium">Uploaded Files</h4>
          </div>
          <ul className="divide-y">
            {uploadedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {uploadProgress[file.name] !== 100 ? (
                    <div className="w-24">
                      <Progress value={uploadProgress[file.name] || 0} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-green-600">Uploaded</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile(index)
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
