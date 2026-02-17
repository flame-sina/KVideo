'use client';

/**
 * IPTVSourceManager - Admin UI to manage M3U playlist sources
 */

import { useState } from 'react';
import { useIPTVStore, type IPTVSource } from '@/lib/store/iptv-store';
import { Icons } from '@/components/ui/Icon';

export function IPTVSourceManager() {
  const { sources, addSource, removeSource, refreshSources, isLoading } = useIPTVStore();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !url.trim()) return;
    addSource(name.trim(), url.trim());
    setName('');
    setUrl('');
    setShowAdd(false);
    // Auto-refresh after adding
    setTimeout(() => refreshSources(), 100);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-color)]">
          直播源管理
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => refreshSources()}
            disabled={isLoading || sources.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icons.RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            刷新
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--accent-color)] text-white rounded-[var(--radius-2xl)] hover:opacity-90 transition-all cursor-pointer"
          >
            <Icons.Plus size={12} />
            添加源
          </button>
        </div>
      </div>

      {/* Add Source Form */}
      {showAdd && (
        <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] space-y-3">
          <input
            type="text"
            placeholder="源名称（如：我的IPTV）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)]/50 focus:outline-none focus:border-[var(--accent-color)]"
          />
          <input
            type="text"
            placeholder="M3U 链接地址"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-sm text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)]/50 focus:outline-none focus:border-[var(--accent-color)]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !url.trim()}
              className="px-3 py-1.5 text-xs bg-[var(--accent-color)] text-white rounded-[var(--radius-2xl)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {/* Source List */}
      {sources.length === 0 ? (
        <div className="text-center py-8 text-sm text-[var(--text-color-secondary)]">
          暂无直播源，请添加 M3U 播放列表链接
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-color)] truncate">{source.name}</p>
                <p className="text-xs text-[var(--text-color-secondary)] truncate">{source.url}</p>
              </div>
              <button
                onClick={() => removeSource(source.id)}
                className="ml-2 p-1.5 text-[var(--text-color-secondary)] hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
              >
                <Icons.Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
