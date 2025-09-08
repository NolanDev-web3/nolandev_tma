/**
 * 获取 CSS 变量的值（支持 fallback）
 * @param name - 变量名，例如 '--main-color'
 * @param fallback - 如果未定义变量，则返回此默认值
 * @param element - 要获取变量的 DOM 元素，默认是 document.documentElement（即 :root）
 * @returns 返回去除空格的变量值（如 '20px'、'#fff'）
 */
export function getCSSVariable(
	name: string,
	fallback: string = '',
	element: HTMLElement = document.documentElement
): string {
	const value = getComputedStyle(element).getPropertyValue(name).trim();
	return value || fallback;
}

/**
 * 获取 CSS 变量的数值部分（去掉 px、rem 等单位）
 * @param name - 变量名，例如 '--header-height'
 * @param fallback - 默认值（数值类型）
 * @param element - DOM 元素，默认为 document.documentElement
 * @returns 返回数字（例如 20），如果解析失败返回 fallback
 */
export function getCSSVarNumber(
	name: string,
	fallback: number = 0,
	element: HTMLElement = document.documentElement
): number {
	const value = getComputedStyle(element).getPropertyValue(name).trim();

	if (!value) return fallback;

	// 提取数值部分（允许 "20", "20px", "1.5rem" 等格式）
	const parsed = parseFloat(value);

	return isNaN(parsed) ? fallback : parsed;
}