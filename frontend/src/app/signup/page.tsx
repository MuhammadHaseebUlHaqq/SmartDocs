"use client";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function SignupPage() {
  const { signup } = useContext(AuthContext)!;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(username, email, password, password2);
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-gray-400 hover:text-white">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
      </Link>
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold">Create your SmartDocs account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-md focus:ring-2 focus:ring-blue-600"
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign Up
          </Button>
        </form>
        <p className="text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-blue-500">Log in</Link>
        </p>
      </div>
    </main>
  );
} 