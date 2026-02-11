import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Palette, Eye, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterConfig } from '@/types/studio';
import { ImageUpload } from '@/components/studio/ImageUpload';

const SKIN_COLORS = [
  '#FDEBD0', '#FCD5A8', '#F5C49C', '#E8B48A', '#D4A574',
  '#C4956A', '#A67B5B', '#8D6748', '#6F4E37', '#5C3D2E', '#3B2417',
];

const HAIR_COLORS = [
  '#FAFAD2', '#F5DEB3', '#DAA520', '#D2691E', '#CD853F',
  '#A0522D', '#8B4513', '#654321', '#3B2F2F', '#1C1C1C', '#000000',
  '#B22222', '#DC143C', '#FF6347', '#FF69B4', '#DA70D6',
  '#9370DB', '#4169E1', '#00CED1', '#32CD32', '#808080',
];

const EYE_COLORS = [
  '#8B4513', '#654321', '#3B2F2F', '#1C1C1C',
  '#006400', '#228B22', '#6B8E23', '#9ACD32',
  '#4169E1', '#1E90FF', '#87CEEB', '#ADD8E6',
  '#708090', '#808080', '#A9A9A9', '#C0C0C0',
  '#DAA520', '#B8860B', '#FF8C00', '#9370DB',
];

const HAIR_COLOR_LABELS: Record<string, string> = {
  '#FAFAD2': 'Platinum Blonde', '#F5DEB3': 'Light Blonde', '#DAA520': 'Golden', '#D2691E': 'Auburn',
  '#CD853F': 'Light Brown', '#A0522D': 'Medium Brown', '#8B4513': 'Dark Brown', '#654321': 'Espresso',
  '#3B2F2F': 'Near Black', '#1C1C1C': 'Jet Black', '#000000': 'Black',
  '#B22222': 'Deep Red', '#DC143C': 'Crimson', '#FF6347': 'Strawberry', '#FF69B4': 'Pink',
  '#DA70D6': 'Lavender', '#9370DB': 'Purple', '#4169E1': 'Blue', '#00CED1': 'Teal',
  '#32CD32': 'Green', '#808080': 'Silver/Gray',
};

const EYE_COLOR_LABELS: Record<string, string> = {
  '#8B4513': 'Dark Brown', '#654321': 'Brown', '#3B2F2F': 'Deep Brown', '#1C1C1C': 'Near Black',
  '#006400': 'Dark Green', '#228B22': 'Green', '#6B8E23': 'Olive Green', '#9ACD32': 'Light Green',
  '#4169E1': 'Blue', '#1E90FF': 'Light Blue', '#87CEEB': 'Sky Blue', '#ADD8E6': 'Pale Blue',
  '#708090': 'Slate Gray', '#808080': 'Gray', '#A9A9A9': 'Light Gray', '#C0C0C0': 'Silver',
  '#DAA520': 'Amber', '#B8860B': 'Dark Amber', '#FF8C00': 'Hazel', '#9370DB': 'Violet',
};

function ColorGrid({ colors, selected, onSelect, labels }: {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`group relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${
            selected === color
              ? 'border-primary ring-2 ring-primary/30 scale-110'
              : 'border-border hover:border-muted-foreground'
          }`}
          style={{ backgroundColor: color }}
          title={labels?.[color] || color}
        >
          {selected === color && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground/80 border border-primary" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function CustomColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Custom:</label>
      <input
        type="color"
        value={value || '#888888'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
      />
      <input
        className="flex-1 bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
        placeholder="#hex or description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="p-1 hover:bg-destructive/20 rounded transition-colors">
          <X className="w-3 h-3 text-destructive" />
        </button>
      )}
    </div>
  );
}

export default function Appearance() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterConfig[]>([]);
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('studio-characters');
    if (stored) {
      setCharacters(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      sessionStorage.setItem('studio-characters', JSON.stringify(characters));
    }
  }, [characters]);

  const char = characters[selectedCharIdx];

  const updateChar = <K extends keyof CharacterConfig>(key: K, value: CharacterConfig[K]) => {
    setCharacters(prev => prev.map((c, i) =>
      i === selectedCharIdx ? { ...c, [key]: value } : c
    ));
  };

  if (!char) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">No characters found. Add a character in the studio first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
          >
            Back to Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Appearance Editor</h1>
          <p className="text-[10px] text-muted-foreground">Customize skin, hair & eye colors</p>
        </div>
        {characters.length > 1 && (
          <div className="ml-auto flex gap-1">
            {characters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedCharIdx(i)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  i === selectedCharIdx
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Preview */}
          {char.faceImage && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <img src={char.faceImage} alt="Face reference" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">{char.label}</h2>
                <p className="text-[11px] text-muted-foreground">Editing appearance settings</p>
              </div>
            </div>
          )}

          {/* Skin Color */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Skin Color</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Choose a skin tone or enter a custom color. This overrides the skin tone slider on the main page.</p>
            <ColorGrid colors={SKIN_COLORS} selected={char.skinColor} onSelect={(c) => updateChar('skinColor', c)} />
            <CustomColorInput value={char.skinColor} onChange={(v) => updateChar('skinColor', v)} />
          </section>

          {/* Hair Color */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Hair Color</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Pick a color or upload a reference image of the desired hair color/style.</p>
            <ColorGrid colors={HAIR_COLORS} selected={char.hairColor} onSelect={(c) => updateChar('hairColor', c)} labels={HAIR_COLOR_LABELS} />
            <CustomColorInput value={char.hairColor} onChange={(v) => updateChar('hairColor', v)} />
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Or upload hair reference image
              </label>
              <ImageUpload label="" value={char.hairColorImage} onChange={(v) => updateChar('hairColorImage', v)} />
            </div>
          </section>

          {/* Eye Color */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Eye Color</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Pick an eye color or upload a close-up reference image.</p>
            <ColorGrid colors={EYE_COLORS} selected={char.eyeColor} onSelect={(c) => updateChar('eyeColor', c)} labels={EYE_COLOR_LABELS} />
            <CustomColorInput value={char.eyeColor} onChange={(v) => updateChar('eyeColor', v)} />
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Or upload eye reference image
              </label>
              <ImageUpload label="" value={char.eyeColorImage} onChange={(v) => updateChar('eyeColorImage', v)} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
