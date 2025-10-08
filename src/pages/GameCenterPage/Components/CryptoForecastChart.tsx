import { MarketsApi } from "@/utils/DashFunApi";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import React, { useEffect, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis, YAxis
} from "recharts";

export interface ForecastPoint {
	date: string;
	actual?: number | null;
	forecast?: number | null;
}

/**
 * 处理逻辑：
 * 1. 找到第一个 forecast 有值的点；
 * 2. 在它前面插入一个锚点，使 forecast 从上一个 actual 开始；
 * 3. 锚点的日期取 data[i-1].date；
 * 4. 保留 forecast 两位小数；
 * 5. 返回新的数组。
 */
export function stitchForecastAnchor(input: ForecastPoint[]): ForecastPoint[] {
	if (!input || input.length === 0) return [];

	// 1️⃣ 确保按日期排序
	const data = [...input].sort((a, b) => a.date.localeCompare(b.date));

	// 2️⃣ 找到第一个 forecast 有值的位置
	const i = data.findIndex(d => d.forecast != null);
	if (i > 0 && data[i - 1].actual != null) {
		data[i - 1].forecast = data[i - 1].actual
	}

	// 5️⃣ 格式化 forecast 为两位小数
	return data.map(d => ({
		...d,
		forecast:
			typeof d.forecast === "number"
				? parseFloat(d.forecast.toFixed(2))
				: d.forecast ?? null,
	}));
}



export interface ForecastResponse {
	symbol: string;
	data: ForecastPoint[];
}

const CryptoForecastChart: React.FC<{ symbol: string }> = ({ symbol }) => {
	const [data, setData] = useState<ForecastPoint[]>([]);
	const [loading, setLoading] = useState(true);
	const initDataRaw = useSignal(initData.raw)


	useEffect(() => {
		const fetchData = async () => {
			try {
				const points = await MarketsApi.forecast(initDataRaw as string, symbol);
				const stitched = stitchForecastAnchor(points);
				setData(stitched);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [symbol]);

	if (loading) return <p>Loading {symbol} forecast...</p>;

	return (
		<div style={{ width: "100%", height: 400 }}>
			<h3>{symbol} - Actual vs Forecast</h3>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data}>
					<CartesianGrid stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
					<XAxis
						dataKey="date"
						tick={{ fill: "#E0E0E0", fontSize: 12 }}
						tickLine={false}
					/>
					<YAxis
						tick={{ fill: "#E0E0E0", fontSize: 12 }}
						tickLine={false}
						domain={["auto", "auto"]}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "rgba(0,0,0,0.75)",
							borderColor: "#333",
							color: "#fff",
						}}
						labelFormatter={(label) => `Date：${label}`}
						formatter={(value, name) => {
							const num = typeof value === "number" ? value : Number(value);
							const pretty = num == null || Number.isNaN(num) ? "--" : num.toFixed(2);
							return [
								pretty,
								name === "actual" ? "Actual" : "Forecast",
							];
						}}
					/>
					<Legend
						wrapperStyle={{ color: "#E0E0E0" }}
						formatter={(value) =>
							value === "actual" ? "Actual" : value === "forecast" ? "Forecast" : value
						}
					/>
					<Line
						type="monotone"
						dataKey="actual"
						stroke="#4FC3F7"
						strokeWidth={2}
						dot={false}
						name="Actual"
					/>
					<Line
						type="monotone"
						dataKey="forecast"
						stroke="#FFB74D"
						strokeWidth={2}
						dot={false}
						strokeDasharray="6 3"
						name="Forecast"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CryptoForecastChart;