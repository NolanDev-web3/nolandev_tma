import type { FC, ReactNode } from 'react';
type Props = { rounded?: 'full' | 'sm' | 'md' | 'lg'; children: ReactNode };
const DFLabel: FC<Props> = ({ children }) => <div className="nd-label">{children}</div>;
export const DFInfoLabel: FC<Props> = ({ children }) => <div className="nd-label nd-label-info">{children}</div>;
export default DFLabel;
