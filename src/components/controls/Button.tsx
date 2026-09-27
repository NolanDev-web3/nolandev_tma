import { Loader2 } from 'lucide-react';
import type { FC, MouseEvent, ReactNode } from 'react';
interface DFButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  mode?: 'plain' | 'primary' | 'normal' | 'danger'; type?: 'button' | 'submit' | 'reset';
  disabled?: boolean; loading?: boolean; className?: string; size?: 's' | 'm' | 'l'; children?: ReactNode;
}
const DFButton: FC<DFButtonProps> = ({ onClick, mode = 'primary', type = 'button', disabled, loading, className = '', size = 'm', children }) =>
  <button type={type} onClick={onClick} disabled={disabled || loading} aria-busy={loading} className={`nd-button nd-button-${mode} ${size === 's' ? 'nd-button-small' : size === 'l' ? 'nd-button-large' : ''} ${className}`}>
    {loading && <Loader2 size={17} className="nd-spin" />}{children}
  </button>;
export default DFButton;
export type { DFButtonProps };
