'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" className="w-full p-2 rounded border dark:bg-gray-700"/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" className="w-full p-2 rounded border dark:bg-gray-700"/>
        <button type="submit" className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700">Sign Up</button>
      </form>
    </div>
  );
}
