import { DFImageAvatar } from "@/components/Avatar/Avatar";
import { ImageUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface AvatarUploadProps {
	size?: number;
	defaultAvatarUrl?: string;
	onAvatarSelected: (avatar: string) => void;
}

export default function AvatarUpload({ onAvatarSelected, size = 64, defaultAvatarUrl }: AvatarUploadProps) {
	const editorRef = useRef<AvatarEditor>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [image, setImage] = useState<string | null>(null);
	const [imgSelected, setImgSelected] = useState<string | null>(null);
	const [scale, setScale] = useState(1.2);

	useEffect(() => {
		if (defaultAvatarUrl) {
			setImgSelected(defaultAvatarUrl);
		}
	}, [defaultAvatarUrl]);

	// 上传文件
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setImage(URL.createObjectURL(e.target.files[0]));
		}
	};

	// 保存头像
	const handleSave = () => {
		if (editorRef.current) {
			const canvas = editorRef.current.getImageScaledToCanvas();
			const dataUrl = canvas.toDataURL("image/png");
			onAvatarSelected(dataUrl);
			setImgSelected(dataUrl); // 设置选中的头像
			setImage(null); // 清除编辑器
		}
	};

	const s = size + 4;

	return <div className="flex flex-col items-center gap-2"	>
		<div className="flex flex-col justify-center items-center rounded-full relative"
			style={{
				minWidth: s,
				width: s,
				height: s,
			}}>
			<DFImageAvatar size={size} nickname="N" image={imgSelected || ""} />
			<div className="absolute inset-0 rounded-full flex items-center justify-center bg-[rgba(0,0,0,0.2)]" onClick={() => {
				fileInputRef.current?.click()
			}}>
				<ImageUp />
			</div>
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				style={{ display: "none" }}
				ref={fileInputRef}
			/>
		</div>
		{/* <DFButton onClick={() => fileInputRef.current?.click()}>Change Profile Picture</DFButton> */}
		{image && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
				<div className="bg-white rounded-lg p-6 flex flex-col items-center">
					<AvatarEditor
						ref={editorRef}
						image={image}
						width={250}
						height={250}
						border={40}
						borderRadius={125}
						color={[0, 0, 0, 0.6]}
						scale={scale}
						rotate={0}
					/>
					<input
						type="range"
						min="1"
						max="3"
						step="0.1"
						value={scale}
						onChange={(e) => setScale(parseFloat(e.target.value))}
						className="my-4 w-48"
					/>
					<div className="flex gap-4">
						<button
							onClick={handleSave}
							className="px-4 py-2 bg-blue-600 text-white rounded"
						>
							Save
						</button>
						<button
							onClick={() => setImage(null)}
							className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		)}
	</div>
	// return (
	// 	<div className="p-4 space-y-4">
	// 		{/* 头像编辑器 */}
	// 		{image && (
	// 			<AvatarEditor
	// 				ref={editorRef}
	// 				image={image}
	// 				width={250}
	// 				height={250}
	// 				border={40}
	// 				borderRadius={125} // 圆形
	// 				color={[255, 255, 255, 0.6]} // 背景色
	// 				scale={scale}
	// 				rotate={0}
	// 			/>
	// 		)}

	// 		{/* 上传文件 */}


	// 		{/* 缩放控制 */}
	// 		{image && (
	// 			<input
	// 				type="range"
	// 				min="1"
	// 				max="3"
	// 				step="0.1"
	// 				value={scale}
	// 				onChange={(e) => setScale(parseFloat(e.target.value))}
	// 			/>
	// 		)}

	// 		{/* 保存按钮 */}
	// 		{image && (
	// 			<button
	// 				onClick={handleSave}
	// 				className="px-4 py-2 bg-blue-600 text-white rounded"
	// 			>
	// 				Save
	// 			</button>
	// 		)}
	// 	</div>
	// );
}