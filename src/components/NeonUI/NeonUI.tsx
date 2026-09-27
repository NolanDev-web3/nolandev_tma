import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Keep the public component names so existing screens share the new design system.
export interface NeonCardProps { className?: string; glowOnHover?: boolean; children?: ReactNode }
export const NeonCard: FC<NeonCardProps> = ({ className = '', glowOnHover = false, children }) =>
  <div className={`nd-card ${glowOnHover ? 'nd-card-hover' : ''} ${className}`}>{children}</div>;

export interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean; asBlock?: boolean; mode?: 'primary' | 'plain'; leftIcon?: ReactNode; rightIcon?: ReactNode;
}
export const NeonButton: FC<NeonButtonProps> = ({ children, disabled, loading = false, asBlock, mode = 'primary', leftIcon, rightIcon, className = '', type = 'button', ...rest }) =>
  <button {...rest} type={type} disabled={disabled || loading} aria-busy={loading} className={`nd-button nd-button-${mode} ${asBlock ? 'w-full' : ''} ${className}`}>
    {loading ? <Loader2 size={17} className="nd-spin" /> : leftIcon}{loading ? 'Please wait…' : children}{!loading && rightIcon}
  </button>;

export interface NeonListItemProps {
  leftBadge?: string; leftSlot?: ReactNode; rightHint?: ReactNode; text: string; onClick?: () => void;
  className?: string; disabled?: boolean; padding?: 'sm' | 'md' | 'lg'; mode?: 'plain' | 'highlight'; selected?: boolean;
}
export const NeonListItem: FC<NeonListItemProps> = ({ leftBadge, leftSlot, rightHint, text, onClick, className = '', disabled, padding = 'md', mode, selected }) => {
  const classes = `nd-list-item ${selected || mode === 'highlight' ? 'nd-list-highlight' : ''} ${className}`;
  const content = <><div className="nd-list-content">{leftSlot ?? (leftBadge && <span className="nd-list-badge">{leftBadge}</span>)}<p>{text}</p></div>{rightHint}</>;
  const style = padding === 'lg' ? { padding: 20 } : padding === 'sm' ? { padding: 10 } : undefined;
  return onClick ? <button type="button" onClick={onClick} disabled={disabled} className={classes} style={style}>{content}</button> : <div className={classes} style={style}>{content}</div>;
};
export const neonTextClass = 'nd-accent';
