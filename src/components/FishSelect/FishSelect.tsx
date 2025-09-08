import { Fish } from "lucide-react";
import { FC, useState } from "react";

const types = [
	{ "id": 1, "name": "Atlantic Salmon", "group": "freshwater" },
	{ "id": 2, "name": "Rainbow Trout", "group": "freshwater" },
	{ "id": 3, "name": "Brown Trout", "group": "freshwater" },
	{ "id": 4, "name": "Largemouth Bass", "group": "freshwater" },
	{ "id": 5, "name": "Smallmouth Bass", "group": "freshwater" },
	{ "id": 6, "name": "Common Carp", "group": "freshwater" },
	{ "id": 7, "name": "Channel Catfish", "group": "freshwater" },
	{ "id": 8, "name": "Northern Pike", "group": "freshwater" },
	{ "id": 9, "name": "Yellow Perch", "group": "freshwater" },
	{ "id": 10, "name": "Walleye", "group": "freshwater" },
	{ "id": 11, "name": "Pacific Halibut", "group": "saltwater" },
	{ "id": 12, "name": "Atlantic Cod", "group": "saltwater" },
	{ "id": 13, "name": "Yellowfin Tuna", "group": "saltwater" },
	{ "id": 14, "name": "Mahi-Mahi (Dorado)", "group": "saltwater" },
	{ "id": 15, "name": "Blue Marlin", "group": "saltwater" },
	{ "id": 16, "name": "Steelhead", "group": "saltwater" },
];

export const FishSelect: FC<{ onChange: (value: string) => void }> = ({ onChange }) => {
	const [fish, setFish] = useState("");
	return <div className="flex gap-2 items-center justify-center  bg-[#f0f0f040] px-4 py-1 rounded-full shadow-md">
		<Fish size={20} className="mr-1" />
		<select
			value={fish ? types.find(t => t.name === fish)?.id ?? "" : ""}
			onChange={(e) => {
				const selected = types.find(t => t.id === Number(e.target.value));
				if (selected) {
					setFish(selected.name);
					onChange(selected.name);
				} else {
					setFish("");
					onChange("");
				}
			}}
			className="bg-transparent"
		>
			<option value="">Today's catch?</option>
			{types.map((type) => (
				<option key={type.id} value={type.id}>
					{type.name}
				</option>
			))}
		</select>
	</div>
};
