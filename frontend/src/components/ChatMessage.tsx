import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { twMerge } from 'tailwind-merge'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  isLoading?: boolean
  className?: string
}

export default function ChatMessage({
  content,
  role,
  isLoading = false,
  className,
}: ChatMessageProps) {
  if (isLoading) {
    return (
      <div className="flex justify-start">
        <div className="rounded-lg glass-dark px-4 py-2 text-white shadow animate-pulse">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={twMerge(
        'mb-4 flex',
        role === 'user' ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={twMerge(
          'rounded-xl px-5 py-3 max-w-[80%] shadow-lg',
          role === 'user'
            ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-semibold'
            : 'glass-dark text-white'
        )}
      >
        {content}
      </div>
    </div>
  )
} 