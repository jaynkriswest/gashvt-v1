'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModeToggle } from "@/components/mode-toggle";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('gas_company');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Error: Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          client_link: companyName,
          role: role,
          username: username,
        }
      }
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Registration successful! Check your email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 transition-colors">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>

      <div className="w-full max-w-lg bg-brand-panel border border-brand-border rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xl font-black text-text-main uppercase tracking-tighter mb-8 border-b border-brand-border pb-4">
          Register Organization
        </h2>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-500 text-[9px] font-bold uppercase ml-1">Organization Name</label>
            <input 
              type="text" 
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-blue-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 text-[9px] font-bold uppercase ml-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 text-[9px] font-bold uppercase ml-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 text-[9px] font-bold uppercase ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 text-[9px] font-bold uppercase ml-1">Confirm</label>
            <input 
              type="password" 
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-text-main outline-none focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-4"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-brand-border pt-6">
          <Link href="/login" className="text-slate-500 hover:text-blue-500 text-[10px] font-bold uppercase">
            ← Return to Authorization
          </Link>
        </div>

        {message && (
          <div className={`mt-6 p-3 rounded-xl text-[10px] font-bold uppercase text-center border ${
            message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}