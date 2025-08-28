import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";
import { SpriteConfig, Animation } from "@/pages/Index";

interface AnimationPlayerProps {
  spriteImage: string | null;
  config: SpriteConfig;
  animation: Animation | undefined;
}

export const AnimationPlayer = ({ spriteImage, config, animation }: AnimationPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState([12]);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (animation) {
      setCurrentFrame(animation.frameStart);
    }
  }, [animation]);

  useEffect(() => {
    if (!isPlaying || !animation) return;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= 1000 / fps[0]) {
        setCurrentFrame(prev => {
          if (prev >= animation.frameEnd) {
            return animation.frameStart;
          }
          return prev + 1;
        });
        lastFrameTimeRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animation, fps]);

  useEffect(() => {
    if (!spriteImage || !canvasRef.current || !animation) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to frame size
      canvas.width = config.frameWidth;
      canvas.height = config.frameHeight;

      // Calculate frame position
      const cols = Math.floor((img.width - config.offsetX) / (config.frameWidth + config.spacing));
      const row = Math.floor(currentFrame / cols);
      const col = currentFrame % cols;
      
      const frameX = config.offsetX + col * (config.frameWidth + config.spacing);
      const frameY = config.offsetY + row * (config.frameHeight + config.spacing);

      // Clear canvas and draw current frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        frameX, frameY, config.frameWidth, config.frameHeight,
        0, 0, config.frameWidth, config.frameHeight
      );
    };
    img.src = spriteImage;
  }, [spriteImage, config, currentFrame, animation]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    if (animation) {
      setCurrentFrame(animation.frameStart);
      setIsPlaying(false);
    }
  };

  const handleFrameChange = (value: number[]) => {
    if (animation) {
      setCurrentFrame(Math.max(animation.frameStart, Math.min(animation.frameEnd, value[0])));
      setIsPlaying(false);
    }
  };

  if (!animation) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        Select an animation to preview
      </div>
    );
  }

  if (!spriteImage) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        Upload a spritesheet first
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canvas Preview */}
      <div className="flex justify-center p-4 bg-secondary/20 rounded-lg border border-border">
        <canvas
          ref={canvasRef}
          className="border border-border rounded"
          style={{ 
            imageRendering: 'pixelated',
            maxWidth: '200px',
            maxHeight: '200px'
          }}
        />
      </div>

      {/* Animation Info */}
      <div className="text-center">
        <h4 className="font-medium text-card-foreground">{animation.name}</h4>
        <p className="text-sm text-muted-foreground">
          Frame {currentFrame} / {animation.frameEnd} ({animation.frameEnd - animation.frameStart + 1} total)
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAnimation}
            className="border-border hover:bg-secondary"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlayback}
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-6"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>

        {/* Frame Scrubber */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Frame</label>
          <Slider
            value={[currentFrame]}
            onValueChange={handleFrameChange}
            min={animation.frameStart}
            max={animation.frameEnd}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* FPS Control */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">FPS: {fps[0]}</label>
          <Slider
            value={fps}
            onValueChange={setFps}
            min={1}
            max={60}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};