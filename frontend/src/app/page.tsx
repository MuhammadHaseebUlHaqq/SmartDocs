'use client'

import Link from 'next/link'
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import HistoryList from '@/components/HistoryList'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export default function Landing() {
  const { token, logout } = useContext(AuthContext) || {} as any;

  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-lg border-b border-white/5">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Smart<span className="text-blue-500">Docs</span>
        </Link>
        <ul className="hidden md:flex items-center space-x-8 text-sm">
          <li>
            <Link href="#services" className="hover:text-blue-400 transition-colors">
              Services
            </Link>
          </li>
          <li>
            <Link href="/history" className="hover:text-blue-400 transition-colors">
              History
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="hover:text-blue-400 transition-colors">
              Pricing
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          <Link
            href="/chat"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-2 rounded-full text-sm font-medium"
          >
            <span>{token ? 'Go to Chat' : 'Start Now'}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          {token && (
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-40 pb-32 relative px-6">
        {/* Status pill */}
        <div className="mb-6 inline-flex items-center space-x-2 bg-green-800/20 text-green-400 px-4 py-1 rounded-full text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span>AI-powered insight</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold max-w-5xl leading-tight">
          World-class <span className="text-blue-500">answers</span>
          <br className="hidden md:block" /> for your documents.
        </h1>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/chat"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 transition-colors text-white px-8 py-4 rounded-xl font-semibold shadow-lg"
          >
            Launch Today
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* History for logged in users */}
      <section id="history" className="py-24 px-6 bg-black text-white border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Your Recent Chats</h2>
          <HistoryList limit={3} />
        </div>
      </section>

      {/* Placeholder sections */}
      <section id="services" className="py-32 px-6 bg-black text-white border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Services</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            SmartDocs offers end-to-end AI document processing, knowledge extraction, and bespoke integrations to
            supercharge your workflow.
          </p>
        </div>
      </section>

      <section id="pricing" className="py-32 px-6 bg-black text-white border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pricing</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Flexible plans for startups and enterprises. Only pay for what you need.
          </p>
        </div>
      </section>
    </main>
  )
}
