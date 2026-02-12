import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, User, Sparkles, Download, Loader2, Palette, Ruler, Shirt } from 'lucide-react';
import { CharacterConfig, BodySize, ExpressionPreset, HairstyleOption, PosePreset, Prop, SkinTone, DistinguishingMark } from '@/types/studio';
import { ImageUpload } from './ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CharacterPanelProps {
  character: CharacterConfig;
  onChange: (updated: CharacterConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const BODY_SIZES: BodySize[] = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
const EXPRESSIONS: { value: ExpressionPreset; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'smiling', label: 'Smiling' },
  { value: 'angry', label: 'Angry' },
  { value: 'horny', label: 'Seductive' },
  { value: 'custom', label: 'Custom' },
];

const POSE_PRESETS: { value: PosePreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'standing', label: 'Standing' },
  { value: 'sitting', label: 'Sitting' },
  { value: 'lying-down', label: 'Lying Down' },
  { value: 'kneeling', label: 'Kneeling' },
  { value: 'crawling', label: 'Crawling' },
  { value: 'squatting', label: 'Squatting' },
  { value: 'leaning', label: 'Leaning' },
  { value: 'arched-back', label: 'Arched Back' },
  { value: 'on-all-fours', label: 'All Fours' },
  { value: 'side-lying', label: 'Side Lying' },
  { value: 'bent-over', label: 'Bent Over' },
  { value: 'looking-back', label: 'Looking Back' },
  { value: 'hands-and-knees', label: 'Hands & Knees' },
  { value: 'custom', label: 'Custom' },
];

const SKIN_TONE_COLORS = [
  '#FDEBD0', '#FCD5A8', '#F5C49C', '#E8B48A', '#D4A574',
  '#C4956A', '#A67B5B', '#8D6748', '#6F4E37', '#5C3D2E', '#3B2417',
];

const SKIN_TONE_LABELS: Record<number, string> = {
  0: 'very fair/porcelain white',
  1: 'fair/light',
  2: 'light peach',
  3: 'light tan',
  4: 'medium light',
  5: 'medium/olive',
  6: 'medium tan',
  7: 'tan/brown',
  8: 'medium dark brown',
  9: 'dark brown',
  10: 'very dark/deep brown',
};

function SizeSelector({ label, value, onChange }: { label: string; value: BodySize; onChange: (v: BodySize) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="flex gap-1">
        {BODY_SIZES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 py-1 text-[10px] uppercase rounded-md transition-colors font-medium ${
              value === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {s === 'extra-large' ? 'XL' : s === 'extra-small' ? 'XS' : s[0].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CharacterPanel({ character, onChange, onRemove, canRemove }: CharacterPanelProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [propsExpanded, setPropsExpanded] = useState(false);
  const [marksExpanded, setMarksExpanded] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedFace, setEnhancedFace] = useState<string | null>(null);

  const enhanceFace = async () => {
    if (!character.faceImage) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-face', {
        body: { imageData: character.faceImage },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      if (data?.imageUrl) {
        setEnhancedFace(data.imageUrl);
        toast.success('Face enhanced! You can download or use it as reference.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to enhance face');
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadEnhancedFace = () => {
    if (!enhancedFace) return;
    const link = document.createElement('a');
    link.href = enhancedFace;
    link.download = `enhanced-face-${Date.now()}.png`;
    link.click();
  };

  const useEnhancedAsFace = () => {
    if (!enhancedFace) return;
    update('faceImage', enhancedFace);
    setEnhancedFace(null);
    toast.success('Enhanced face set as reference!');
  };

  const update = <K extends keyof CharacterConfig>(key: K, value: CharacterConfig[K]) => {
    onChange({ ...character, [key]: value });
  };

  const addProp = () => {
    const prop: Prop = { id: crypto.randomUUID(), name: '', imageData: null, placement: '' };
    update('props', [...character.props, prop]);
    setPropsExpanded(true);
  };

  const updateProp = (id: string, changes: Partial<Prop>) => {
    update('props', character.props.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  const removeProp = (id: string) => {
    update('props', character.props.filter((p) => p.id !== id));
  };

  const addMark = () => {
    const mark: DistinguishingMark = { id: crypto.randomUUID(), type: 'tattoo', description: '', imageData: null };
    update('distinguishingMarks', [...character.distinguishingMarks, mark]);
    setMarksExpanded(true);
  };

  const updateMark = (id: string, changes: Partial<DistinguishingMark>) => {
    update('distinguishingMarks', character.distinguishingMarks.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  };

  const removeMark = (id: string) => {
    update('distinguishingMarks', character.distinguishingMarks.filter((m) => m.id !== id));
  };

  const formatHeight = (inches: number) => {
    const ft = Math.floor(inches / 12);
    const inc = inches % 12;
    return `${ft}'${inc}"`;
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        <User className="w-3.5 h-3.5 text-primary" />
        <input
          className="bg-transparent text-sm font-semibold text-foreground flex-1 outline-none"
          value={character.label}
          onChange={(e) => update('label', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        {character.faceImage && (
          <img src={character.faceImage} alt="" className="w-6 h-6 rounded-full object-cover border border-border" />
        )}
        {canRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:bg-destructive/20 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {/* Core Images */}
          <div className="grid grid-cols-2 gap-2">
            <ImageUpload label="Face (Front)" value={character.faceImage} onChange={(v) => { update('faceImage', v); setEnhancedFace(null); }} />
            <ImageUpload label="Face (Side)" value={character.sideProfileImage} onChange={(v) => update('sideProfileImage', v)} />
          </div>

          {/* Additional Face References */}
          {character.faceImage && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Additional Face Refs</label>
                {(character.additionalFaceImages?.length || 0) < 4 && (
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          update('additionalFaceImages', [...(character.additionalFaceImages || []), result]);
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
              {character.additionalFaceImages && character.additionalFaceImages.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {character.additionalFaceImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Face ref ${idx + 2}`} className="w-12 h-12 rounded-md object-cover border border-border" />
                      <button
                        onClick={() => update('additionalFaceImages', character.additionalFaceImages.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-muted-foreground">Add more angles for better accuracy (max 4)</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ImageUpload label="Clothing" value={character.clothingImage} onChange={(v) => update('clothingImage', v)} />
          </div>
          {/* Preserve Exact Head Toggle */}
          {character.faceImage && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={character.preserveExactHead}
                onChange={(e) => update('preserveExactHead', e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-xs font-medium text-foreground">Preserve exact head & face (full body)</span>
            </label>
          )}
          {/* Face Enhancement */}
          {character.faceImage && (
            <div className="space-y-2">
              <button
                onClick={enhanceFace}
                disabled={isEnhancing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isEnhancing ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Enhancing...</>
                ) : (
                  <><Sparkles className="w-3 h-3" /> Enhance Face (HD)</>
                )}
              </button>
              {enhancedFace && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enhanced Result</label>
                    <button onClick={() => setEnhancedFace(null)} className="p-0.5 hover:bg-destructive/20 rounded transition-colors">
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={enhancedFace} alt="Enhanced face" className="w-full h-32 object-cover" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={useEnhancedAsFace}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <Sparkles className="w-3 h-3" /> Use as Face
                    </button>
                    <button
                      onClick={downloadEnhancedFace}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clothing Description</label>
            <input
              className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="Describe clothing... e.g. 'Red cocktail dress with heels'"
              value={character.clothingText}
              onChange={(e) => update('clothingText', e.target.value)}
            />
          </div>
          <ImageUpload label="Pose Reference" value={character.poseReferenceImage} onChange={(v) => update('poseReferenceImage', v)} />

          {/* Hairstyle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hairstyle</label>
            <div className="flex gap-1">
              {(['default', 'custom-text', 'custom-image'] as HairstyleOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => update('hairstyleOption', opt)}
                  className={`flex-1 py-1 text-[10px] uppercase rounded-md transition-colors font-medium ${
                    character.hairstyleOption === opt
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {opt === 'default' ? 'Keep' : opt === 'custom-text' ? 'Type' : 'Image'}
                </button>
              ))}
            </div>
            {character.hairstyleOption === 'custom-text' && (
              <input
                className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                placeholder="Describe hairstyle..."
                value={character.hairstyleText}
                onChange={(e) => update('hairstyleText', e.target.value)}
              />
            )}
            {character.hairstyleOption === 'custom-image' && (
              <ImageUpload label="" value={character.hairstyleImage} onChange={(v) => update('hairstyleImage', v)} />
            )}
          </div>

          {/* Body Sizes */}
          <div className="grid grid-cols-3 gap-2">
            <SizeSelector label="Chest" value={character.chestSize} onChange={(v) => update('chestSize', v)} />
            <SizeSelector label="Butt" value={character.buttSize} onChange={(v) => update('buttSize', v)} />
            <SizeSelector label="Stomach" value={character.stomachSize} onChange={(v) => update('stomachSize', v)} />
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={character.heightEnabled}
                onChange={(e) => update('heightEnabled', e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Specify Height
              </span>
            </label>
            {character.heightEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground w-10">{formatHeight(character.height)}</span>
                  <input
                    type="range"
                    min={48}
                    max={78}
                    step={1}
                    value={character.height}
                    onChange={(e) => update('height', Number(e.target.value))}
                    className="flex-1 h-2 appearance-none rounded-full cursor-pointer bg-secondary"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>4'0"</span>
                  <span>5'3"</span>
                  <span>6'6"</span>
                </div>
              </>
            )}
          </div>

          {/* Skin Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skin Tone</label>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: SKIN_TONE_COLORS[character.skinTone] }}
              />
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={character.skinTone}
                onChange={(e) => update('skinTone', Number(e.target.value) as SkinTone)}
                className="flex-1 h-2 appearance-none rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${SKIN_TONE_COLORS.join(', ')})`,
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Fair</span>
              <span>Medium</span>
              <span>Dark</span>
            </div>
          </div>

          {/* Editor Links */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => navigate('/appearance')}
              className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Palette className="w-3 h-3" /> Appearance Editor
            </button>
            <button
              onClick={() => navigate('/clothing')}
              className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Shirt className="w-3 h-3" /> Clothing Editor
            </button>
          </div>

          {/* Expression */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expression</label>
            <div className="flex flex-wrap gap-1">
              {EXPRESSIONS.map((exp) => (
                <button
                  key={exp.value}
                  onClick={() => update('expressionPreset', exp.value)}
                  className={`px-2 py-1 text-[10px] uppercase rounded-md transition-colors font-medium ${
                    character.expressionPreset === exp.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
            {character.expressionPreset === 'custom' && (
              <input
                className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                placeholder="Describe expression..."
                value={character.customExpression}
                onChange={(e) => update('customExpression', e.target.value)}
              />
            )}
          </div>

          {/* Pose Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pose Preset</label>
            <div className="flex flex-wrap gap-1">
              {POSE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => update('posePreset', p.value)}
                  className={`px-2 py-1 text-[10px] uppercase rounded-md transition-colors font-medium ${
                    character.posePreset === p.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action / Pose Description</label>
            <textarea
              className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
              placeholder="What is this person doing? e.g. 'Standing with arms crossed, looking at Person 2'"
              value={character.actionPrompt}
              onChange={(e) => update('actionPrompt', e.target.value)}
            />
          </div>

          {/* Props */}
          <div className="space-y-1.5">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setPropsExpanded(!propsExpanded)}
            >
              {propsExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer">
                Props ({character.props.length})
              </label>
              <button
                onClick={(e) => { e.stopPropagation(); addProp(); }}
                className="ml-auto p-0.5 hover:bg-secondary rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-primary" />
              </button>
            </div>
            {propsExpanded && character.props.map((prop) => (
              <div key={prop.id} className="flex gap-2 items-start bg-secondary/50 rounded-md p-2">
                <ImageUpload label="" value={prop.imageData} onChange={(v) => updateProp(prop.id, { imageData: v })} compact />
                <div className="flex-1 space-y-1">
                  <input
                    className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[11px] text-foreground outline-none"
                    placeholder="Prop name (e.g. Sunglasses)"
                    value={prop.name}
                    onChange={(e) => updateProp(prop.id, { name: e.target.value })}
                  />
                  <input
                    className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[11px] text-foreground outline-none"
                    placeholder="Placement (e.g. on face, left hand)"
                    value={prop.placement}
                    onChange={(e) => updateProp(prop.id, { placement: e.target.value })}
                  />
                </div>
                <button onClick={() => removeProp(prop.id)} className="p-0.5 hover:bg-destructive/20 rounded">
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {/* Distinguishing Marks */}
          <div className="space-y-1.5">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setMarksExpanded(!marksExpanded)}
            >
              {marksExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer">
                Marks / Tattoos ({character.distinguishingMarks.length})
              </label>
              <button
                onClick={(e) => { e.stopPropagation(); addMark(); }}
                className="ml-auto p-0.5 hover:bg-secondary rounded transition-colors"
              >
                <Plus className="w-3 h-3 text-primary" />
              </button>
            </div>
            {marksExpanded && character.distinguishingMarks.map((mark) => (
              <div key={mark.id} className="flex gap-2 items-start bg-secondary/50 rounded-md p-2">
                <ImageUpload label="" value={mark.imageData} onChange={(v) => updateMark(mark.id, { imageData: v })} compact />
                <div className="flex-1 space-y-1">
                  <select
                    className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[11px] text-foreground outline-none"
                    value={mark.type}
                    onChange={(e) => updateMark(mark.id, { type: e.target.value as DistinguishingMark['type'] })}
                  >
                    <option value="tattoo">Tattoo</option>
                    <option value="birthmark">Birthmark</option>
                    <option value="scar">Scar</option>
                    <option value="piercing">Piercing</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[11px] text-foreground outline-none"
                    placeholder="Description (e.g. dragon tattoo, heart-shaped birthmark)"
                    value={mark.description}
                    onChange={(e) => updateMark(mark.id, { description: e.target.value })}
                  />
                </div>
                <button onClick={() => removeMark(mark.id)} className="p-0.5 hover:bg-destructive/20 rounded">
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function X(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
