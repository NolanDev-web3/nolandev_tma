import { FC } from "react";
const Label: FC<{ text: string, className?: string }> = ({ text, className = "" }) => {
	// const width = Number(height) / 60 * 200;
	return <div className={`flex items-center pl-3 pr-3 py-[1px] ${className} bg-blue-400 bg-opacity-30 rounded-lg`} style={{
		//backgroundImage: `url(${label})`, backgroundSize: 'cover',
	}}>
		<p className="text-sm font-semibold text-white">{text}</p>
	</div>
};

export default Label;