'use client';

/**
 * IPTVPlayer - Lightweight player for IPTV live streams
 * Uses HLS.js for playback with a channel switching sidebar
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Icons } from '@/components/ui/Icon';
import type { M3UChannel } from '@/lib/utils/m3u-parser';

interface IPTVPlayerProps {
  channel: M3UChannel;
  onClose: () => void;
  channels: M3UChannel[];
  onChannelChange: (channel: M3UChannel) => void;
}

export function IPTVPlayer({ channel, onClose, channels, onChannelChange }: IPTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadChannel = useCallback((ch: M3UChannel) => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = ch.url;

    if (url.endsWith('.m3u8') || url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveDurationInfinity: true,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setIsLoading(false);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setError('网络错误，无法加载频道');
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              setError('播放错误，请尝试其他频道');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari/iOS)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(() => {});
        }, { once: true });
        video.addEventListener('error', () => {
          setIsLoading(false);
          setError('播放错误');
        }, { once: true });
      } else {
        setError('您的浏览器不支持 HLS 播放');
        setIsLoading(false);
      }
    } else {
      // Direct video URL (mp4, etc.)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('播放错误');
      }, { once: true });
    }
  }, []);

  useEffect(() => {
    loadChannel(channel);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, loadChannel]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex">
      {/* Player Area */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          playsInline
          autoPlay
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/70 text-sm">加载中...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={() => loadChannel(channel)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors cursor-pointer"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {/* LIVE Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="text-white text-sm font-medium drop-shadow-lg">{channel.name}</span>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
          >
            <Icons.List size={20} />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
          >
            <Icons.X size={20} />
          </button>
        </div>
      </div>

      {/* Channel Sidebar */}
      {showSidebar && (
        <div className="w-72 bg-[#111] border-l border-white/10 overflow-y-auto">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">频道列表</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-white/50 hover:text-white cursor-pointer"
            >
              <Icons.X size={16} />
            </button>
          </div>
          <div className="p-1">
            {channels.map((ch, i) => (
              <button
                key={`${ch.name}-${i}`}
                onClick={() => {
                  onChannelChange(ch);
                  setShowSidebar(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  ch.url === channel.url
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {ch.url === channel.url && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  )}
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.group && (
                  <span className={`text-[10px] ${
                    ch.url === channel.url ? 'text-white/60' : 'text-white/30'
                  }`}>
                    {ch.group}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
