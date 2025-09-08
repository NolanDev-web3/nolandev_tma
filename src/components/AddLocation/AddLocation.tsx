import { FC, useEffect, useState } from "react";
import { useLocationCity } from "./useLocationCity";
import { DFText } from "../controls";
import { CircleX, MapPin, MapPinCheck } from "lucide-react";
interface AddLocationProps {
	onLocationChanged?: (location: string) => void;
}
const AddLocation: FC<AddLocationProps> = ({ onLocationChanged }) => {
	const { locate } = useLocationCity(false);
	const [location, setLocation] = useState("")
	const handleGetLocation = async () => {
		try {
			const info = await locate();
			console.log("Location data:", info);
			if (info != null) {
				setLocation(`${info.state}, ${info.country}`)
			} else {
				setLocation("");
			}
		} catch (e) {
			console.error("Failed to get location", e);
		}
	};
	const clearLocation = () => {
		setLocation("");
	}

	useEffect(() => {
		if (onLocationChanged) {
			onLocationChanged(location);
		}
	}, [location, onLocationChanged]);

	return (
		<div className="flex flex-col items-center justify-center h-full bg-[#f0f0f040] px-4 py-1 rounded-full shadow-md">
			{location == "" ? <div onClick={handleGetLocation} className="flex items-center cursor-pointer">
				<MapPin size={16} className="mr-1" />
				<DFText size="sm" weight="1" >
					Add location
				</DFText>
			</div> : <div className="flex items-center">
				<MapPinCheck size={16} className="mr-1" />
				<DFText size="sm" weight="1">
					{location}
				</DFText>
				<CircleX size={18} fill="#ffffff99" className="ml-2 cursor-pointer text-gray-700" onClick={clearLocation} />
			</div>}
		</div>
	);
}

export default AddLocation;