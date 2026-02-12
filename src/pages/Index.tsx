import { useState, useCallback } from 'react';
import { Plus, Wand2, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { CharacterConfig, GenerationSettings, GeneratedImage, createDefaultCharacter } from '@/types/studio';
import { CharacterPanel } from '@/components/studio/CharacterPanel';
import { GenerationSettingsPanel } from '@/components/studio/GenerationSettings';
import { GeneratedGallery } from '@/components/studio/GeneratedGallery';
import { useImageGeneration } from '@/hooks/useImageGeneration';

const defaultSettings: GenerationSettings = {
  model: 'google/gemini-3-pro-image-preview',
  aspectRatio: 'auto',
  customAspectRatio: '',
  cameraAngle: 'auto',
  customCameraAngle: '',
  backgroundImage: null,
  backgroundText: '',
  lighting: 'auto',
  skinDetail: 'auto',
  eyeDetail: 'auto',
  confineToBackground: false,
};

export default function Index() {
  const [characters, setCharacters] = useState<CharacterConfig[]>([
    createDefaultCharacter(crypto.randomUUID(), 0),
  ]);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const { isGenerating, generatedImages, generate, clearHistory } = useImageGeneration();
  const addCharacter = useCallback(() => {
    if (characters.length >= 5) return;
    setCharacters((prev) => [...prev, createDefaultCharacter(crypto.randomUUID(), prev.length)]);
  }, [characters.length]);

  const removeCharacter = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCharacter = useCallback((id: string, updated: CharacterConfig) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const handleReprompt = useCallback((image: GeneratedImage) => {
    setCharacters(image.characters);
    setSettings(image.settings);
  }, []);

  const handleGenerate = () => {
    generate(characters, settings);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Sidebar - Controls */}
      <aside className="w-[340px] min-w-[340px] border-r border-border flex flex-col bg-card">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">AI Photo Studio</h1>
            <p className="text-[10px] text-muted-foreground">Ultra-realistic image generation</p>
          </div>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
          {/* Generation Settings */}
          <div className="border border-border rounded-lg bg-card p-3">
            <GenerationSettingsPanel settings={settings} onChange={setSettings} />
          </div>

          {/* Characters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Characters</h2>
              {characters.length < 5 && (
                <button
                  onClick={addCharacter}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
            {characters.map((char) => (
              <CharacterPanel
                key={char.id}
                character={char}
                onChange={(updated) => updateCharacter(char.id, updated)}
                onRemove={() => removeCharacter(char.id)}
                canRemove={characters.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin-slow" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Image
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSettings(defaultSettings);
              setCharacters([createDefaultCharacter(crypto.randomUUID(), 0)]);
            }}
            className="w-full py-1.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Settings
          </button>
        </div>
      </aside>

      {/* Main Area - Gallery */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Gallery</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">{generatedImages.length} images</span>
            {generatedImages.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-semibold text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
        <GeneratedGallery images={generatedImages} onReprompt={handleReprompt} />
      </main>
    </div>
  );
}
