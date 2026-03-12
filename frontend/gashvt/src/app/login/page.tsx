// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // This uses official Supabase Auth instead of the manual table query
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard') // Move to your logistics dashboard
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <form onSubmit={handleLogin} className="p-8 bg-slate-800 rounded-lg border border-slate-700">
        <h1 className="text-xl font-bold mb-4 text-center">🚛 Gas Logistics Login</h1>
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 mb-4 bg-slate-700 rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 mb-4 bg-slate-700 rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="w-full bg-blue-600 p-2 rounded font-bold hover:bg-blue-500">
          Secure Login
        </button>
      </form>
    </div>
  )
}