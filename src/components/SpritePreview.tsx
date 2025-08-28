import { useRef, useEffect, useState } from "react";
import { SpriteConfig, Animation } from "@/pages/Index";

interface SpritePreviewProps {
  spriteImage: string | null;
  config: SpriteConfig;
  totalFrames: number;
  selectedAnimation: string | null;
  animations: Animation[];
}

export const SpritePreview = ({ 
  spriteImage, 
  config, 
  totalFrames, 
  selectedAnimation, 
  animations 
}: SpritePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  
  useEffect(() => {
    if (!spriteImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the sprite image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Draw grid overlay
      drawGrid(ctx, img.width, img.height);
      
      // Highlight frames for selected animation
      if (selectedAnimation) {
        const animation = animations.find(a => a.id === selectedAnimation);
        if (animation) {
          highlightAnimationFrames(ctx, animation);
        }
      }
      
      // Highlight hovered frame
      if (hoveredFrame !== null) {
        highlightFrame(ctx, hoveredFrame, 'hsl(180 100% 50% / 0.7)');
      }
    };
    img.src = spriteImage;
  }, [spriteImage, config, totalFrames, selectedAnimation, animations, hoveredFrame]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (config.frameWidth === 0 || config.frameHeight === 0) return;
    
    ctx.strokeStyle = 'hsl(180 50% 50% / 0.5)';
    ctx.lineWidth = 1;
    
    const cols = Math.floor((width - config.offsetX) / (config.frameWidth + config.spacing));
    const rows = Math.floor((height - config.offsetY) / (config.frameHeight + config.spacing));
    
    // Draw vertical lines
    for (let col = 0; col <= cols; col++) {
      const x = config.offsetX + col * (config.frameWidth + config.spacing);
      ctx.beginPath();
      ctx.moveTo(x, config.offsetY);
      ctx.lineTo(x, config.offsetY + rows * (config.frameHeight + config.spacing));
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let row = 0; row <= rows; row++) {
      const y = config.offsetY + row * (config.frameHeight + config.spacing);
      ctx.beginPath();
      ctx.moveTo(config.offsetX, y);
      ctx.lineTo(config.offsetX + cols * (config.frameWidth + config.spacing), y);
      ctx.stroke();
    }
    
    // Draw frame numbers
    ctx.fillStyle = 'hsl(210 20% 92%)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < totalFrames; i++) {
      const { x, y } = getFramePosition(i);
      ctx.fillText(
        i.toString(), 
        x + config.frameWidth / 2, 
        y + config.frameHeight / 2
      );
    }
  };
  
  const highlightAnimationFrames = (ctx: CanvasRenderingContext2D, animation: Animation) => {
    for (let i = animation.frameStart; i <= animation.frameEnd; i++) {
      highlightFrame(ctx, i, 'hsl(160 100% 35% / 0.4)');
    }
  };
  
  const highlightFrame = (ctx: CanvasRenderingContext2D, frameIndex: number, color: string) => {
    if (frameIndex >= totalFrames) return;
    
    const { x, y } = getFramePosition(frameIndex);
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, config.frameWidth, config.frameHeight);
  };
  
  const getFramePosition = (frameIndex: number) => {
    if (!spriteImage) return { x: 0, y: 0 };
    
    const cols = Math.floor((canvasRef.current?.width || 0 - config.offsetX) / (config.frameWidth + config.spacing));
    const row = Math.floor(frameIndex / cols);
    const col = frameIndex % cols;
    
    return {
      x: config.offsetX + col * (config.frameWidth + config.spacing),
      y: config.offsetY + row * (config.frameHeight + config.spacing)
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || totalFrames === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Check if mouse is over a frame
    const cols = Math.floor((canvasRef.current.width - config.offsetX) / (config.frameWidth + config.spacing));
    
    if (x >= config.offsetX && y >= config.offsetY) {
      const col = Math.floor((x - config.offsetX) / (config.frameWidth + config.spacing));
      const row = Math.floor((y - config.offsetY) / (config.frameHeight + config.spacing));
      const frameIndex = row * cols + col;
      
      if (frameIndex < totalFrames) {
        const frameX = config.offsetX + col * (config.frameWidth + config.spacing);
        const frameY = config.offsetY + row * (config.frameHeight + config.spacing);
        
        if (x >= frameX && x <= frameX + config.frameWidth && 
            y >= frameY && y <= frameY + config.frameHeight) {
          setHoveredFrame(frameIndex);
          return;
        }
      }
    }
    
    setHoveredFrame(null);
  };

  if (!spriteImage) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        Upload a spritesheet to see the preview
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[500px] border border-border rounded-lg">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredFrame(null)}
        className="max-w-full cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};