import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Download } from "lucide-react";
import { Animation } from "@/pages/Index";
import { toast } from "sonner";

interface JsonOutputProps {
  animations: Animation[];
}

export const JsonOutput = ({ animations }: JsonOutputProps) => {
  const [copied, setCopied] = useState(false);

  const jsonOutput = animations.map(({ id, ...animation }) => animation);
  const jsonString = JSON.stringify(jsonOutput, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy JSON");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded!");
  };

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">JSON Output</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={animations.length === 0}
            className="border-border hover:bg-secondary"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadJson}
            disabled={animations.length === 0}
            className="border-border hover:bg-secondary"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-secondary/20 max-h-80 overflow-auto">
        {animations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No animations to display
          </div>
        ) : (
          <pre className="text-xs text-card-foreground font-mono leading-relaxed">
            {jsonString}
          </pre>
        )}
      </Card>

      {animations.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {animations.length} animation{animations.length !== 1 ? 's' : ''} • {jsonString.length} characters
        </div>
      )}
    </div>
  );
};