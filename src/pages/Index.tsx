import { useState } from "react";
import { SpriteUpload } from "@/components/SpriteUpload";
import { SpritePreview } from "@/components/SpritePreview";
import { AnimationPanel } from "@/components/AnimationPanel";
import { AnimationPlayer } from "@/components/AnimationPlayer";
import { JsonOutput } from "@/components/JsonOutput";

export interface SpriteConfig {
  frameWidth: number;
  frameHeight: number;
  spacing: number;
  offsetX: number;
  offsetY: number;
}

export interface Animation {
  id: string;
  name: string;
  frameStart: number;
  frameEnd: number;
}

const Index = () => {
  const [spriteImage, setSpriteImage] = useState<string | null>(null);
  const [spriteConfig, setSpriteConfig] = useState<SpriteConfig>({
    frameWidth: 32,
    frameHeight: 32,
    spacing: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [totalFrames, setTotalFrames] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sprite Animation Visualizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload a spritesheet and create JSON animation configs
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Upload & Config */}
          <div className="space-y-4">
            <SpriteUpload
              onImageUpload={setSpriteImage}
              config={spriteConfig}
              onConfigChange={setSpriteConfig}
              onFrameCountUpdate={setTotalFrames}
              spriteImage={spriteImage}
            />
            
            <AnimationPanel
              animations={animations}
              onAnimationsChange={setAnimations}
              totalFrames={totalFrames}
              onAnimationSelect={setSelectedAnimation}
              selectedAnimation={selectedAnimation}
            />
          </div>

          {/* Center Panel - Sprite Preview */}
          <div className="panel p-4">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Sprite Preview</h3>
            <SpritePreview
              spriteImage={spriteImage}
              config={spriteConfig}
              totalFrames={totalFrames}
              selectedAnimation={selectedAnimation}
              animations={animations}
            />
          </div>

          {/* Right Panel - Animation Player & JSON */}
          <div className="space-y-4">
            <div className="panel p-4">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Animation Preview</h3>
              <AnimationPlayer
                spriteImage={spriteImage}
                config={spriteConfig}
                animation={animations.find(a => a.id === selectedAnimation)}
              />
            </div>

            <JsonOutput animations={animations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;