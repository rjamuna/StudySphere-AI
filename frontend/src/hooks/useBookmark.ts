import { useState, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface BookmarkPayload {
  type: 'chat' | 'notes' | 'roadmap' | 'quiz' | 'pdf' | 'resource';
  title: string;
  description?: string;
  link: string;
  refId: string;
  tags?: string[];
}

export function useBookmark() {
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggle = useCallback(async (payload: BookmarkPayload) => {
    const key = payload.refId;
    if (loading[key]) return;
    setLoading(l => ({ ...l, [key]: true }));
    try {
      if (bookmarked[key]) {
        // Find and delete — fetch bookmarks filtered by refId via description match
        const { data } = await api.get('/bookmarks', { params: { type: payload.type } });
        const existing = data.find((b: any) => b.refId === key);
        if (existing) {
          await api.delete(`/bookmarks/${existing._id}`);
          setBookmarked(b => ({ ...b, [key]: false }));
          toast.success('Bookmark removed');
        }
      } else {
        await api.post('/bookmarks', payload);
        setBookmarked(b => ({ ...b, [key]: true }));
        toast.success('Bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }, [bookmarked, loading]);

  const isBookmarked = (refId: string) => !!bookmarked[refId];
  const isLoading   = (refId: string) => !!loading[refId];

  return { toggle, isBookmarked, isLoading };
}
