import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  thumbnail: string;
  title: string;
}

const VideoPlayer = ({ thumbnail, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-black aspect-video">
      {/* Video Thumbnail/Placeholder */}
      <img 
        src={thumbnail} 
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* Play Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <button 
            onClick={() => setIsPlaying(true)}
            className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
            max={100}
            step={1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>12:35</span>
            <span>35:42</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <SkipForward className="w-5 h-5" />
            </Button>
            
            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  setIsMuted(value[0] === 0);
                }}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
