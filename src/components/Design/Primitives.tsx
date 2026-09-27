import { ArrowLeft, Inbox, Loader2 } from 'lucide-react';
import { type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { useNavigate } from 'react-router-dom';

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <header className="nd-page-heading"><span className="nd-eyebrow">NOLAN / {eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</header>;
}
export function BackLink({ to = '/game-center/main', children = 'Back to home' }: { to?: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return <button className="nd-back" onClick={() => navigate(to)}><ArrowLeft size={17} />{children}</button>;
}
export function EmptyState({ title, description, icon = <Inbox size={26} /> }: { title: string; description: string; icon?: ReactNode }) {
  return <div className="nd-empty"><span className="nd-empty-icon">{icon}</span><h3>{title}</h3><p>{description}</p></div>;
}
export function LoadingState({ children = 'Loading…' }: { children?: ReactNode }) {
  return <div className="nd-loading" role="status"><Loader2 size={20} className="nd-spin" />{children}</div>;
}
// Compatible with existing login Input call sites while keeping visible labels and one theme.
export function FormInput({ before, status, className = '', placeholder, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { before?: ReactNode; status?: 'error' | 'focused' }) {
  const generatedId = useId();
  const label = props.type === 'email' ? 'Email address' : props.type === 'password' ? (id === 'repeat' ? 'Confirm password' : 'Password') : id === 'verify' ? 'Verification code' : placeholder === 'DELETE' ? 'Confirmation' : 'Nickname';
  return <label className={`nd-form-field ${className}`} htmlFor={id ?? generatedId}>
    <span>{label}</span>
    <div className={`nd-form-input ${status === 'error' ? 'has-error' : ''}`}>
      {before}<input {...props} id={id ?? generatedId} placeholder={placeholder} aria-invalid={status === 'error'} />
    </div>
  </label>;
}
