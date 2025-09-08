import { formatNumber } from '@/constats';
import React from 'react';

interface NumberProps {
	value: number;
	className?: string;
}

const Number: React.FC<NumberProps> = ({ value, className }) => {
	return <span className={className}>{formatNumber(value)}</span>;
};

export default Number;
