'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface AudioPreviewProps {
  src: string;
  title: string;
}

export default function AudioPreview({ src, title }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoaded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration);
      setIsLoading(false);
      setHasError(false);
    }
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('AudioPreview: Failed to load audio', e);
    setIsLoading(false);
    setHasError(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('AudioPreview: Setting up audio from', src);

    let timeoutId: NodeJS.Timeout;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => {
      console.log('AudioPreview: Loading started');
      setIsLoading(true);
    };

    // 设置超时，5秒后即使没加载完也显示播放器
    timeoutId = setTimeout(() => {
      console.log('AudioPreview: Loading timeout, showing player anyway');
      setIsLoading(false);
    }, 5000);

    // 检查音频是否已经加载完成
    if (audio.readyState >= 1) {
      handleLoaded();
      clearTimeout(timeoutId);
    }

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('loadeddata', handleLoaded);
    audio.addEventListener('canplay', handleLoaded);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    // 强制触发加载
    audio.load();

    return () => {
      clearTimeout(timeoutId);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('loadeddata', handleLoaded);
      audio.removeEventListener('canplay', handleLoaded);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [src, handleLoaded, handleError]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => {
        console.error('AudioPreview: Play failed', e);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <div className="text-gray-800 mb-2">音频加载失败</div>
        <div className="text-gray-500 text-sm mb-4">路径: {src}</div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          下载音频
        </a>
      </div>
    );
  }

  // 即使还在加载，也显示播放器
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate" title={title}>{title}</h3>
          <p className="text-gray-500">
            {isLoading ? '音频加载中...' : '音频播放'}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-gray-800"
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
