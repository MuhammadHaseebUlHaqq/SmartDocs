"use client";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const { login, googleLogin } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error("Invalid credentials");
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
        <h1 className="text-3xl font-bold">Sign in to SmartDocs</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email or username"
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
          <Button type="submit" className="w-full" isLoading={loading}>
            Login
          </Button>
        </form>
        <div className="flex items-center justify-center mt-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <GoogleLogin
            onSuccess={(credentialResponse: any) => {
              if (credentialResponse.credential) {
                googleLogin(credentialResponse.credential);
              }
            }}
            onError={() => toast.error("Google sign-in failed")}
          />
        </div>
        <p className="text-sm text-gray-400">
          Don't have an account? <Link href="/signup" className="text-blue-500">Sign up</Link>
        </p>
      </div>
    </main>
  );
} 