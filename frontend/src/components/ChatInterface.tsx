'use client'

import { useState, useCallback, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import DocumentUpload from '@/components/DocumentUpload'
import ChatMessage from '@/components/ChatMessage'
import Button from '@/components/ui/Button'
import {
  uploadDocument,
  queryDocument,
  getDocumentStatus,
  getChatHistory,
  type ChatMessage as ChatMessageType,
} from '@/lib/api'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthContext } from '@/context/AuthContext'

export default function ChatInterface() {
  const { token, logout } = useContext(AuthContext)!
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const [isUploading, setIsUploading] = useState(false)
  const initialDocId = searchParams.get('doc') ? Number(searchParams.get('doc')) : null;
  const [documentId, setDocumentId] = useState<number | null>(initialDocId)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDocReady, setIsDocReady] = useState(initialDocId ? true : false)

  // Load previous messages if opening from history
  useEffect(() => {
    const loadHistory = async () => {
      if (initialDocId && messages.length === 0) {
        try {
          const history = await getChatHistory(initialDocId)
          const mapped: ChatMessageType[] = []
          history.forEach((rec) => {
            mapped.push({ role: 'user', content: rec.question })
            mapped.push({ role: 'assistant', content: rec.answer })
          })
          setMessages(mapped)
        } catch (e) {
          /* ignore */
        }
      }
    }
    loadHistory()
  }, [initialDocId, messages.length])

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const document = await uploadDocument(file)
      setDocumentId(document.id)
      pollDocumentStatus(document.id)
      toast.success('Document uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload document')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !documentId || isProcessing) return

    const userMessage = inputMessage.trim()
    const newMessage: ChatMessageType = { role: 'user', content: userMessage }

    // Prepare history that includes the new user message for the API call
    const historyForRequest = [...messages, newMessage]

    // Clear input but keep the message visible
    setInputMessage('')
    // Add user message immediately
    setMessages((prev) => [...prev, newMessage])
    setIsProcessing(true)

    try {
      const response = await queryDocument(documentId, userMessage, historyForRequest)

      // Extract *only* the latest assistant message (to avoid duplicates)
      const latestAssistant = response.chat_history
        .filter((msg) => msg.role === 'assistant')
        .pop()

      if (latestAssistant) {
        setMessages((prev) => [...prev, latestAssistant])
      }
    } catch (error) {
      toast.error('Failed to get answer')
      console.error('Query error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Polling helper
  const pollDocumentStatus = useCallback(
    async (docId: number, retries = 60) => {
      try {
        const status = await getDocumentStatus(docId)
        if (status.has_chunks) {
          setIsDocReady(true)
          return
        }
      } catch (err) {
        /* ignore individual errors */
      }
      if (retries > 0) {
        setTimeout(() => pollDocumentStatus(docId, retries - 1), 1000)
      } else {
        toast.error('Document processing timed out. Please try again.')
      }
    },
    []
  )

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start bg-black relative overflow-x-hidden text-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-lg border-b border-white/5">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Smart<span className="text-blue-500">Docs</span>
        </Link>
        <span className="hidden sm:block text-sm text-gray-400">Chat with your documents ⚡</span>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 transition-colors text-white px-4 py-2 rounded-full text-xs font-medium"
          >
            <ArrowRightIcon className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </nav>

      {/* Document Upload & Chat Section */}
      <section className="w-full max-w-4xl mt-32 mb-24 px-4">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl shadow-xl">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-2">SmartDocs Chat</h2>
            <p className="mb-4 text-sm text-gray-400">
              Upload a document and ask anything &mdash; our AI will answer using only the document's content.
            </p>
            {!documentId && (
              <div className="mt-8">
                <DocumentUpload onUpload={handleUpload} isUploading={isUploading} className="glass" />
              </div>
            )}
            {documentId && !isDocReady && (
              <div className="mt-8 text-center text-white/90">
                <p className="animate-pulse">Processing your document... ⏳</p>
              </div>
            )}
            {documentId && (
              <div className="mt-8 space-y-6">
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-800">
                  <div className="h-[400px] overflow-y-auto p-6 custom-scrollbar">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} content={message.content} role={message.role} className="" />
                    ))}
                    {isProcessing && <ChatMessage content="" role="assistant" isLoading className="glass-dark" />}
                  </div>
                  <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 bg-neutral-800">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={isDocReady ? 'Ask a question about your document...' : 'Document is processing...'}
                        className="block w-full rounded-md bg-neutral-900 py-2 px-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600 border border-white/10"
                        disabled={!isDocReady || isProcessing}
                      />
                      <Button
                        type="submit"
                        disabled={!isDocReady || isProcessing || !inputMessage.trim()}
                        isLoading={isProcessing}
                        variant="primary"
                        className="px-6 py-2"
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
} 