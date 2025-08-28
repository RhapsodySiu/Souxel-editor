import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Edit3, Plus, Play } from "lucide-react";
import { Animation } from "@/pages/Index";
import { toast } from "sonner";

interface AnimationPanelProps {
  animations: Animation[];
  onAnimationsChange: (animations: Animation[]) => void;
  totalFrames: number;
  onAnimationSelect: (id: string | null) => void;
  selectedAnimation: string | null;
}

export const AnimationPanel = ({
  animations,
  onAnimationsChange,
  totalFrames,
  onAnimationSelect,
  selectedAnimation
}: AnimationPanelProps) => {
  const [formData, setFormData] = useState({
    name: "",
    frameStart: 0,
    frameEnd: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddAnimation = () => {
    if (!formData.name.trim()) {
      toast.error("Animation name is required");
      return;
    }

    if (formData.frameStart < 0 || formData.frameEnd >= totalFrames) {
      toast.error(`Frame range must be between 0 and ${totalFrames - 1}`);
      return;
    }

    if (formData.frameStart > formData.frameEnd) {
      toast.error("Frame start must be less than or equal to frame end");
      return;
    }

    const newAnimation: Animation = {
      id: editingId || generateId(),
      name: formData.name.trim(),
      frameStart: formData.frameStart,
      frameEnd: formData.frameEnd
    };

    if (editingId) {
      // Update existing animation
      const updatedAnimations = animations.map(anim => 
        anim.id === editingId ? newAnimation : anim
      );
      onAnimationsChange(updatedAnimations);
      setEditingId(null);
      toast.success("Animation updated successfully!");
    } else {
      // Add new animation
      onAnimationsChange([...animations, newAnimation]);
      toast.success("Animation added successfully!");
    }

    // Reset form
    setFormData({ name: "", frameStart: 0, frameEnd: 0 });
  };

  const handleEditAnimation = (animation: Animation) => {
    setFormData({
      name: animation.name,
      frameStart: animation.frameStart,
      frameEnd: animation.frameEnd
    });
    setEditingId(animation.id);
  };

  const handleDeleteAnimation = (id: string) => {
    const updatedAnimations = animations.filter(anim => anim.id !== id);
    onAnimationsChange(updatedAnimations);
    if (selectedAnimation === id) {
      onAnimationSelect(null);
    }
    toast.success("Animation deleted successfully!");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", frameStart: 0, frameEnd: 0 });
  };

  return (
    <div className="panel p-4 space-y-4">
      <h3 className="text-lg font-semibold text-card-foreground">Animation Manager</h3>
      
      {/* Animation Form */}
      <Card className="p-4 bg-secondary/20">
        <div className="space-y-3">
          <div>
            <Label htmlFor="animName" className="text-sm text-muted-foreground">Animation Name</Label>
            <Input
              id="animName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., idle, walk, run"
              className="bg-input border-input-border"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="frameStart" className="text-sm text-muted-foreground">Start Frame</Label>
              <Input
                id="frameStart"
                type="number"
                value={formData.frameStart}
                onChange={(e) => setFormData({ ...formData, frameStart: parseInt(e.target.value) || 0 })}
                min="0"
                max={totalFrames - 1}
                className="bg-input border-input-border"
              />
            </div>
            
            <div>
              <Label htmlFor="frameEnd" className="text-sm text-muted-foreground">End Frame</Label>
              <Input
                id="frameEnd"
                type="number"
                value={formData.frameEnd}
                onChange={(e) => setFormData({ ...formData, frameEnd: parseInt(e.target.value) || 0 })}
                min="0"
                max={totalFrames - 1}
                className="bg-input border-input-border"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddAnimation} 
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
              disabled={totalFrames === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Update" : "Add"} Animation
            </Button>
            
            {editingId && (
              <Button 
                variant="outline" 
                onClick={cancelEdit}
                className="border-border hover:bg-secondary"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Animation List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        <h4 className="text-sm font-medium text-muted-foreground">
          Animations ({animations.length})
        </h4>
        
        {animations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No animations created yet
          </div>
        ) : (
          animations.map((animation) => (
            <Card 
              key={animation.id} 
              className={`p-3 cursor-pointer transition-colors ${
                selectedAnimation === animation.id 
                  ? 'bg-primary/20 border-primary/50' 
                  : 'hover:bg-secondary/30'
              }`}
              onClick={() => onAnimationSelect(
                selectedAnimation === animation.id ? null : animation.id
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-card-foreground">{animation.name}</h5>
                  <p className="text-sm text-muted-foreground">
                    Frames {animation.frameStart}-{animation.frameEnd} 
                    ({animation.frameEnd - animation.frameStart + 1} frames)
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  {selectedAnimation === animation.id && (
                    <Play className="w-4 h-4 text-primary" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAnimation(animation);
                    }}
                    className="h-8 w-8 p-0 hover:bg-secondary"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAnimation(animation.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};