import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { SpriteConfig } from "@/pages/Index";
import { toast } from "sonner";

interface SpriteUploadProps {
  onImageUpload: (imageUrl: string) => void;
  config: SpriteConfig;
  onConfigChange: (config: SpriteConfig) => void;
  onFrameCountUpdate: (count: number) => void;
  spriteImage: string | null;
}

export const SpriteUpload = ({
  onImageUpload,
  config,
  onConfigChange,
  onFrameCountUpdate,
  spriteImage
}: SpriteUploadProps) => {
  
  const calculateFrameCount = useCallback((imageUrl: string, cfg: SpriteConfig) => {
    const img = new Image();
    img.onload = () => {
      const cols = Math.floor((img.width - cfg.offsetX) / (cfg.frameWidth + cfg.spacing));
      const rows = Math.floor((img.height - cfg.offsetY) / (cfg.frameHeight + cfg.spacing));
      const total = Math.max(0, cols * rows);
      onFrameCountUpdate(total);
    };
    img.src = imageUrl;
  }, [onFrameCountUpdate]);

  useEffect(() => {
    if (spriteImage) {
      calculateFrameCount(spriteImage, config);
    }
  }, [spriteImage, config, calculateFrameCount]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      toast.success("Spritesheet uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const updateConfig = (key: keyof SpriteConfig, value: number) => {
    const newConfig = { ...config, [key]: Math.max(0, value) };
    onConfigChange(newConfig);
  };

  return (
    <div className="panel p-4 space-y-4">
      <h3 className="text-lg font-semibold text-card-foreground">Spritesheet Upload</h3>
      
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <label className="block p-6 cursor-pointer text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload spritesheet or drag and drop
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </Card>

      <div className="space-y-3">
        <h4 className="text-md font-medium text-card-foreground">Frame Configuration</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="frameWidth" className="text-sm text-muted-foreground">Width</Label>
            <Input
              id="frameWidth"
              type="number"
              value={config.frameWidth}
              onChange={(e) => updateConfig('frameWidth', parseInt(e.target.value) || 0)}
              className="bg-input border-input-border"
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="frameHeight" className="text-sm text-muted-foreground">Height</Label>
            <Input
              id="frameHeight"
              type="number"
              value={config.frameHeight}
              onChange={(e) => updateConfig('frameHeight', parseInt(e.target.value) || 0)}
              className="bg-input border-input-border"
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="spacing" className="text-sm text-muted-foreground">Spacing</Label>
            <Input
              id="spacing"
              type="number"
              value={config.spacing}
              onChange={(e) => updateConfig('spacing', parseInt(e.target.value) || 0)}
              className="bg-input border-input-border"
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="offsetX" className="text-sm text-muted-foreground">Offset X</Label>
            <Input
              id="offsetX"
              type="number"
              value={config.offsetX}
              onChange={(e) => updateConfig('offsetX', parseInt(e.target.value) || 0)}
              className="bg-input border-input-border"
              min="0"
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="offsetY" className="text-sm text-muted-foreground">Offset Y</Label>
            <Input
              id="offsetY"
              type="number"
              value={config.offsetY}
              onChange={(e) => updateConfig('offsetY', parseInt(e.target.value) || 0)}
              className="bg-input border-input-border"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};