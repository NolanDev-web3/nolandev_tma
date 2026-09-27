import { DFImageAvatar } from '@/components/Avatar/Avatar';
import { Sheet } from '@/components/Design/Sheet';
import { NeonButton } from '@/components/NeonUI/NeonUI';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import AvatarEditor from 'react-avatar-editor';
interface AvatarUploadProps { size?: number; defaultAvatarUrl?: string; onAvatarSelected: (avatar: string) => void }
export default function AvatarUpload({ onAvatarSelected, size = 88, defaultAvatarUrl }: AvatarUploadProps) {
  const editor = useRef<AvatarEditor>(null);
  const input = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState(defaultAvatarUrl ?? '');
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState('');
  useEffect(() => { setSelected(defaultAvatarUrl ?? ''); }, [defaultAvatarUrl]);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setScale(1.2); setError(''); setImage(URL.createObjectURL(file)); event.target.value = '';
  };
  const save = () => {
    if (!editor.current) return;
    try { const url = editor.current.getImageScaledToCanvas().toDataURL('image/png'); onAvatarSelected(url); setSelected(url); setImage(null); }
    catch { setError('This image couldn’t be saved. Please try another image.'); }
  };
  return <div className="flex flex-col items-center gap-2">
    <button className="relative rounded-full" aria-label="Change profile photo" onClick={() => input.current?.click()}><DFImageAvatar size={size} nickname="N" image={selected} /><span className="absolute -bottom-1 -right-1 nd-icon-button" style={{ width: 30, height: 30, borderRadius: 10 }}><Camera size={15} /></span></button>
    <input ref={input} type="file" accept="image/*" onChange={choose} className="hidden" aria-label="Choose profile image" />
    {error && <p className="nd-error" role="alert">{error}</p>}
    {image && <Sheet title="Adjust your photo" onClose={() => setImage(null)}><div className="flex flex-col items-center gap-5"><AvatarEditor ref={editor} image={image} width={220} height={220} border={15} borderRadius={110} color={[12, 21, 33, 0.85]} scale={scale} rotate={0} onLoadFailure={() => { setError('This image couldn’t be opened.'); setImage(null); }} /><label className="w-full nd-muted text-xs">Zoom<input aria-label="Photo zoom" type="range" min="1" max="3" step="0.1" value={scale} onChange={event => setScale(Number(event.target.value))} className="w-full mt-3" style={{ accentColor: 'var(--nd-accent)' }} /></label><div className="flex gap-3 w-full"><NeonButton mode="plain" className="flex-1" onClick={() => setImage(null)}>Cancel</NeonButton><NeonButton className="flex-1" onClick={save}>Use photo</NeonButton></div></div></Sheet>}
  </div>;
}
