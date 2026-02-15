'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Smart Bookmark App</h1>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
}