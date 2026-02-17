/**
 * IPTV Store - Manages IPTV/M3U playlist sources and cached channels
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseM3U, type M3UChannel } from '@/lib/utils/m3u-parser';

export interface IPTVSource {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

interface IPTVState {
  sources: IPTVSource[];
  cachedChannels: M3UChannel[];
  cachedGroups: string[];
  lastRefreshed: number;
  isLoading: boolean;
}

interface IPTVActions {
  addSource: (name: string, url: string) => void;
  removeSource: (id: string) => void;
  refreshSources: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

interface IPTVStore extends IPTVState, IPTVActions {}

export const useIPTVStore = create<IPTVStore>()(
  persist(
    (set, get) => ({
      sources: [],
      cachedChannels: [],
      cachedGroups: [],
      lastRefreshed: 0,
      isLoading: false,

      addSource: (name, url) => {
        const id = `iptv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          sources: [...state.sources, { id, name, url, addedAt: Date.now() }],
        }));
      },

      removeSource: (id) => {
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
        }));
      },

      refreshSources: async () => {
        const { sources } = get();
        if (sources.length === 0) {
          set({ cachedChannels: [], cachedGroups: [], lastRefreshed: Date.now() });
          return;
        }

        set({ isLoading: true });

        try {
          const allChannels: M3UChannel[] = [];
          const allGroups = new Set<string>();

          await Promise.all(
            sources.map(async (source) => {
              try {
                const res = await fetch('/api/iptv?' + new URLSearchParams({ url: source.url }));
                if (!res.ok) return;
                const text = await res.text();
                const playlist = parseM3U(text);
                allChannels.push(...playlist.channels);
                playlist.groups.forEach((g) => allGroups.add(g));
              } catch (e) {
                console.error(`Failed to fetch IPTV source: ${source.name}`, e);
              }
            })
          );

          set({
            cachedChannels: allChannels,
            cachedGroups: Array.from(allGroups).sort(),
            lastRefreshed: Date.now(),
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'kvideo-iptv-store',
      partialize: (state) => ({
        sources: state.sources,
        cachedChannels: state.cachedChannels,
        cachedGroups: state.cachedGroups,
        lastRefreshed: state.lastRefreshed,
      }),
    }
  )
);
