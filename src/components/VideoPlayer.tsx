import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, PictureInPicture2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Resume from last position
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && hasStarted) {
      videoRef.current.currentTime = initialTime;
    }
  }, [hasStarted, initialTime]);

  // Save progress to localStorage for resume
  useEffect(() => {
    if (lessonId && currentTime > 0) {
      localStorage.setItem(`video_progress_${lessonId}`, String(currentTime));
    }
  }, [currentTime, lessonId]);

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

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
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

  // If no video URL, show thumbnail-only player
  if (!videoUrl) {
    return (
      <div className="relative group rounded-2xl overflow-hidden bg-black aspect-video">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <button className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 shadow-lg">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="mb-4">
            <Slider value={[35]} max={100} step={1} className="cursor-pointer" />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>12:35</span>
              <span>35:42</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Play className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <SkipForward className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Slider value={[80]} max={100} step={1} className="w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="1">
                <SelectTrigger className="w-16 h-8 text-xs bg-transparent border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYBACK_SPEEDS.map(s => (
                    <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <PictureInPicture2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative group rounded-2xl overflow-hidden bg-black aspect-video"
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

      {/* Play overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer" onClick={startPlayback}>
          <button className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 shadow-lg">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-4">
          <Slider
            value={[progressPercent]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handlePlay}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(-10)}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(10)}>
              <SkipForward className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Select value={String(playbackSpeed)} onValueChange={handleSpeedChange}>
              <SelectTrigger className="w-16 h-8 text-xs bg-transparent border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_SPEEDS.map(s => (
                  <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePiP}>
              <PictureInPicture2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
