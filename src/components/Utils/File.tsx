export function dataURLtoBlob(dataURL: string): Blob {
	if (!dataURL || dataURL == "") return new Blob();
	const [meta, b64] = dataURL.split(",");
	const mime = (meta.match(/data:(.*?);base64/) || [])[1] || "image/png";
	const binStr = atob(b64);
	const len = binStr.length;
	const u8 = new Uint8Array(len);
	for (let i = 0; i < len; i++) u8[i] = binStr.charCodeAt(i);
	return new Blob([u8], { type: mime });
}

export async function urlToDataURL(url: string): Promise<string> {
	const response = await fetch(url);
	const blob = await response.blob();
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
		reader.onerror = (error) => {
			reject(error);
		};
		reader.readAsDataURL(blob);
	});
};

