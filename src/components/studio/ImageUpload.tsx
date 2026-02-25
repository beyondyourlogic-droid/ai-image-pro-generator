import { useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Download } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (data: string | null) => void;
  compact?: boolean;
}

export function ImageUpload({ label, value, onChange, compact = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, [handleFile]);

  const downloadImage = useCallback((data: string) => {
    const ext = data.startsWith('data:image/png') ? 'png' : data.startsWith('data:image/webp') ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.href = data;
    link.download = `${label.replace(/\s+/g, '-').toLowerCase() || 'image'}-${Date.now()}.${ext}`;
    link.click();
  }, [label]);

  if (compact && value) {
    return (
      <div className="relative group">
        <img src={value} alt={label} className="w-12 h-12 rounded-md object-cover border border-border" />
        <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => downloadImage(value)}
            className="w-4 h-4 bg-primary rounded-full flex items-center justify-center"
          >
            <Download className="w-2.5 h-2.5 text-primary-foreground" />
          </button>
          <button
            onClick={() => onChange(null)}
            className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-destructive-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-border">
          <img src={value} alt={label} className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Replace
            </button>
            <button
              onClick={() => downloadImage(value)}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              Save
            </button>
            <button
              onClick={() => onChange(null)}
              className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors min-h-[80px]"
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Click or drag</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
