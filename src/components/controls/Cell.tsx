import type { FC, MouseEventHandler, ReactNode } from 'react';
export type DFCellProps = {
  children: ReactNode; className?: string; subtitle?: ReactNode; before?: ReactNode; after?: ReactNode;
  mode?: 'normal' | 'highlight' | 'primary' | 'wood'; disableBeforeRing?: boolean; onClick?: MouseEventHandler;
};
const DFCell: FC<DFCellProps> = ({ children, mode = 'normal', className = '', subtitle, before, after, onClick }) =>
  <div className={`nd-cell ${mode === 'highlight' ? 'nd-cell-highlight' : ''} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={event => { if (onClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.currentTarget.click(); } }}>
    {before && <div className="shrink-0">{before}</div>}<div className="flex-1 min-w-0"><div>{children}</div>{subtitle && <div className="text-xs nd-muted mt-1">{subtitle}</div>}</div>{after && <div className="shrink-0">{after}</div>}
  </div>;
export default DFCell;
