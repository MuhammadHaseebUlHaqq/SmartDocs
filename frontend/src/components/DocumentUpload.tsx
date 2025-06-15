import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { twMerge } from 'tailwind-merge'

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  className?: string
  accept?: Record<string, string[]>
  maxSize?: number
}

export default function DocumentUpload({
  onUpload,
  isUploading = false,
  className,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}: DocumentUploadProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      await onUpload(acceptedFiles[0])
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={twMerge(
        'flex justify-center items-center rounded-2xl border border-dashed border-white/20 px-8 py-12 glass-dark bg-[#0d0d0f]/60 transition-all duration-300',
        isDragActive && 'border-blue-500 shadow-lg',
        isUploading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="text-center">
        <DocumentArrowUpIcon
          className={twMerge(
            'mx-auto h-14 w-14 text-teal-300 drop-shadow-lg',
            isDragActive && 'text-blue-300 animate-bounce'
          )}
          aria-hidden="true"
        />
        <div className="mt-4 flex text-base leading-6 text-white/90">
          <input {...getInputProps()} />
          <p className="pl-1">
            {isUploading
              ? 'Uploading...'
              : isDragActive
              ? 'Drop the file here'
              : 'Drag and drop your document here, or click to select'}
          </p>
        </div>
        <p className="text-xs leading-5 text-white/60 mt-2">
          PDF, DOC, or DOCX up to {maxSize / 1024 / 1024}MB
        </p>
      </div>
    </div>
  )
} 