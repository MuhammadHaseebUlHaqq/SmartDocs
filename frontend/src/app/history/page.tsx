"use client";
import HistoryList from '@/components/HistoryList';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-8">Your Recent Chats</h1>
      <div className="max-w-3xl space-y-2">
        <HistoryList />
      </div>
    </main>
  );
} 