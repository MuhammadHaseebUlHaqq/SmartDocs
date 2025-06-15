"use client";
import { useEffect, useState, useContext } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

interface Query {
  id: number;
  document: number;
  document_title: string;
  question: string;
  answer: string;
  created_at: string;
}

export default function HistoryList({ limit }: { limit?: number } = {}) {
  const { token } = useContext(AuthContext)!;
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchHistory = async () => {
      try {
        const res = await api.get<Query[]>('/queries/');
        setQueries(res.data);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  if (!token) return null;
  if (loading) return <p className="text-gray-400">Loading history...</p>;

  // Keep only the **first** question per document (earliest one)
  const grouped: Query[] = [];
  const seen = new Set<number>();
  [...queries].reverse().forEach((q) => {
    // reverse() so earliest appears first given queries are desc order from API
    if (!seen.has(q.document)) {
      seen.add(q.document);
      grouped.push(q);
    }
  });

  const display = limit ? grouped.slice(0, limit) : grouped;

  if (display.length === 0) return <p className="text-gray-400">No history yet</p>;

  return (
    <div className="space-y-2">
      {display.map((q) => (
        <Link
          key={q.id}
          href={`/chat?doc=${q.document}`}
          className="flex items-start p-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-white truncate">{q.question}</p>
            <p className="text-xs text-gray-500">{new Date(q.created_at).toLocaleString()}</p>
          </div>
          <span className="text-xs text-gray-400 ml-2">{q.document_title}</span>
        </Link>
      ))}
    </div>
  );
} 