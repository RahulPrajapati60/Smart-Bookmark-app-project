'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';


const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session) {
        router.push('/auth'); 
      } else {
        fetchBookmarks(session.user.id);
        subscribeToBookmarks(session.user.id);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        router.push('/auth');
      } else {
        fetchBookmarks(newSession.user.id);
        subscribeToBookmarks(newSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return;
    }
    setBookmarks(data || []);
  };

  const subscribeToBookmarks = (userId: string) => {
    const channel = supabase
      .channel(`bookmarks:user_${userId}`) 
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime change:', payload);
          fetchBookmarks(userId);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addBookmark = async () => {
    if (!session?.user?.id || !url || !title) return;

    const { error } = await supabase.from('bookmarks').insert({
      url,
      title,
      user_id: session.user.id,
    });

    if (error) {
      console.error('Error adding bookmark:', error);
      alert('Failed to add bookmark');
    } else {
      setUrl('');
      setTitle('');
    }
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting bookmark:', error);
      alert('Failed to delete');
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add Form */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addBookmark}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium"
        >
          Add Bookmark
        </button>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500">No bookmarks yet. Add one!</p>
      ) : (
        <ul className="space-y-4">
          {bookmarks.map((bm) => (
            <li
              key={bm.id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded border border-gray-200 hover:bg-gray-100 transition"
            >
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {bm.title}
              </a>
              <button
                onClick={() => deleteBookmark(bm.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}