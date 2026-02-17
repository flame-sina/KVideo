'use client';

/**
 * IPTVChannelGrid - Displays IPTV channels grouped by category with search
 */

import { useState, useMemo } from 'react';
import { Icons } from '@/components/ui/Icon';
import type { M3UChannel } from '@/lib/utils/m3u-parser';

interface IPTVChannelGridProps {
  channels: M3UChannel[];
  groups: string[];
  onSelect: (channel: M3UChannel) => void;
  activeChannel?: M3UChannel | null;
}

export function IPTVChannelGrid({ channels, groups, onSelect, activeChannel }: IPTVChannelGridProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedGroup) {
      result = result.filter((c) => c.group === selectedGroup);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    return result;
  }, [channels, selectedGroup, search]);

  if (channels.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-color-secondary)]">
        <Icons.TV size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm">暂无频道</p>
        <p className="text-xs mt-1">请先添加 M3U 直播源</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Group Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color-secondary)]" />
          <input
            type="text"
            placeholder="搜索频道..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)]/50 focus:outline-none focus:border-[var(--accent-color)]"
          />
        </div>
      </div>

      {/* Group Tabs */}
      {groups.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-3 py-1 text-xs rounded-[var(--radius-2xl)] border transition-all cursor-pointer ${
              selectedGroup === null
                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-color)] hover:border-[var(--accent-color)]/30'
            }`}
          >
            全部 ({channels.length})
          </button>
          {groups.map((group) => {
            const count = channels.filter((c) => c.group === group).length;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group === selectedGroup ? null : group)}
                className={`px-3 py-1 text-xs rounded-[var(--radius-2xl)] border transition-all cursor-pointer ${
                  selectedGroup === group
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                    : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-color)] hover:border-[var(--accent-color)]/30'
                }`}
              >
                {group} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Channel Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filteredChannels.map((channel, index) => (
          <button
            key={`${channel.name}-${index}`}
            onClick={() => onSelect(channel)}
            className={`group p-3 rounded-[var(--radius-2xl)] border text-left transition-all duration-200 cursor-pointer ${
              activeChannel?.url === channel.url
                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-[0_4px_12px_rgba(var(--accent-color-rgb),0.3)]'
                : 'bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] hover:border-[var(--accent-color)]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt=""
                  className="w-8 h-8 rounded object-contain bg-black/10 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                  activeChannel?.url === channel.url ? 'bg-white/20' : 'bg-[var(--glass-bg)]'
                }`}>
                  <Icons.TV size={14} className={activeChannel?.url === channel.url ? 'text-white/70' : 'text-[var(--text-color-secondary)]'} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium truncate ${
                  activeChannel?.url === channel.url ? 'text-white' : 'text-[var(--text-color)]'
                }`}>
                  {channel.name}
                </p>
                {channel.group && (
                  <p className={`text-[10px] truncate ${
                    activeChannel?.url === channel.url ? 'text-white/70' : 'text-[var(--text-color-secondary)]'
                  }`}>
                    {channel.group}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-8 text-sm text-[var(--text-color-secondary)]">
          未找到匹配的频道
        </div>
      )}
    </div>
  );
}
