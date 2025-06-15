'use client'

import { Suspense } from 'react'
import ChatInterface from '@/components/ChatInterface'

function ChatFallback() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white">
      <div className="animate-pulse">Loading chat...</div>
    </main>
  )
}

export default function Chat() {
  return (
    <Suspense fallback={<ChatFallback />}>
      <ChatInterface />
    </Suspense>
  )
} 