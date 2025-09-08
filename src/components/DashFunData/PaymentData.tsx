type Prices = Price[]

type Price = {
	label: string,
	amount: number
}

class TgInvoiceData {
	/**
	 * invoice title
	 */
	title: string = "";
	description: string = "";
	/**
	 * 自定义数据
	 */
	payload: string = "";
	/**
	 * 星星支付用XTR
	 */
	currency: string = "XTR";
	prices: Prices = [];

	/**
	 * XTR支付这里不需要填
	 */
	provider_token: string = "";
}

export type { Prices, Price }
export { TgInvoiceData }