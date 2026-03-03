import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, PictureInPicture2, Download, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface VideoPlayerProps {
  thumbnail: string;
  title: string;
  videoUrl?: string;
  lessonId?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  initialTime?: number;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayer = ({ thumbnail, title, videoUrl, lessonId, onProgress, onComplete, initialTime = 0 }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (videoRef.current && initialTime > 0 && hasStarted) {
      videoRef.current.currentTime = initialTime;
    }
  }, [hasStarted, initialTime]);

  useEffect(() => {
    if (lessonId && currentTime > 0) {
      localStorage.setItem(`video_progress_${lessonId}`, String(currentTime));
    }
  }, [currentTime, lessonId]);

  // Show skip intro button in first 30 seconds
  useEffect(() => {
    if (hasStarted && currentTime < 30 && currentTime > 2) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }
  }, [currentTime, hasStarted]);

  const getSavedTime = useCallback(() => {
    if (!lessonId) return 0;
    const saved = localStorage.getItem(`video_progress_${lessonId}`);
    return saved ? parseFloat(saved) : 0;
  }, [lessonId]);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (!hasStarted) setHasStarted(true);
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const startPlayback = () => {
    setHasStarted(true);
    if (videoRef.current) {
      const savedTime = getSavedTime();
      if (savedTime > 0) videoRef.current.currentTime = savedTime;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    onProgress?.(videoRef.current.currentTime, videoRef.current.duration);
    if (videoRef.current.duration - videoRef.current.currentTime < 2) {
      onComplete?.();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = (value[0] / 100) * duration;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const v = value[0] / 100;
    videoRef.current.volume = v;
    setVolume(value[0]);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: string) => {
    const s = parseFloat(speed);
    setPlaybackSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error('PiP not supported:', e);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  const skipIntro = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 30;
    setShowSkipIntro(false);
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      toast.error('No video available to download');
      return;
    }
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Thumbnail-only placeholder player
  if (!videoUrl) {
    return (
      <div className="relative group rounded-xl overflow-hidden bg-card border border-border aspect-video">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
            <Play className="w-7 h-7 text-primary-foreground ml-0.5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent">
          <p className="text-sm text-primary-foreground/70 text-center">No video available for this lesson</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative group rounded-xl overflow-hidden bg-foreground aspect-video border border-border"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onEnded={() => { setIsPlaying(false); onComplete?.(); }}
        onClick={handlePlay}
      />

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute bottom-24 right-4 z-20 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FastForward className="w-4 h-4" />
          Skip Intro
        </button>
      )}

      {/* Play overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center cursor-pointer" onClick={startPlayback}>
          <button className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[progressPercent]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-primary-foreground/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={handlePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={() => skip(-10)}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={() => skip(10)}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 ml-1">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
            <span className="text-xs text-primary-foreground/60 ml-2 hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <Select value={String(playbackSpeed)} onValueChange={handleSpeedChange}>
              <SelectTrigger className="w-14 h-7 text-xs bg-transparent border-primary-foreground/30 text-primary-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_SPEEDS.map(s => (
                  <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={handleDownload} title="Download Video">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={togglePiP} title="Picture in Picture">
              <PictureInPicture2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
