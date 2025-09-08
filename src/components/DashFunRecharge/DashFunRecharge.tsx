import { RechargeOrderStatus, RechargePriceType, RechargePriceTypeText, toCurrency } from "@/constats";
import diamondIcon from "@/icons/dashfun-diamond4.png";
import starIcon from "@/icons/star-icon.png";
import { RechargeApi, RechargeLink, RechargeOrder } from "@/utils/DashFunApi";
import { isInDashFunApp, isInTelegram, orderSaveKey } from "@/utils/Utils";
import { initData, invoice, openLink, retrieveLaunchParams, useLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { Button, Spinner, Text, Title } from "@telegram-apps/telegram-ui";
import { motion } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import { useDashFunCoins } from "../DashFun/DashFunCoins";
import { useDashFunUser } from "../DashFun/DashFunUser";
import { L, LangKeys } from "../Language/Language";
import Section from "../Section/Section";

import aniFailed from "@/assets/animation/failed.json";
import aniSuccess from "@/assets/animation/successful.json";

import { Player } from "@lottiefiles/react-lottie-player";
import CountUp from "../CountUp/CountUp";
import { TopupItem, UserRechargeEvent } from "../Event/Events";
import { DFButton, DFCell, DFLabel, DFText } from "../controls";
import "./DashFunRecharge.css";
import { useEffectOnActive } from "keepalive-for-react";

type OrderInfo = {
    orderId: string,
    optionIndex: number,
    channelPayId?: string
}

const useRechargePlatform = () => {
    const ps = useLaunchParams();
    let platform = ps.platform;

    const appStr = isInDashFunApp();

    if (appStr != null) {
        //如果在DashFun应用中，使用应用平台
        platform = "dfapp_" + appStr;
    }

    return platform;
}

const priceToString = (price: number, priceType: number) => {
    if (priceType == RechargePriceType.TGSTAR) {
        return <div className="flex items-center justify-center flex-row gap-1"><img src={starIcon} className="w-4" />{toCurrency(price, 0) + " Stars"} </div>
    } else {
        return <p>{"$" + toCurrency(price / 100)}</p>;
    }
}

const calcFinalPrice = (price: number, off: number) => {
    const p = off > 0 ? price * ((1000 - off) / 1000) : price;
    return Math.floor(p);
}

const payingOrder = (userId: string): OrderInfo => {
    if (userId == "") return { orderId: "", optionIndex: -1 };
    const str = localStorage.getItem(orderSaveKey(userId)) || "";
    if (str == "") {
        return {
            orderId: "",
            optionIndex: -1
        }
    } else {
        const order = JSON.parse(str) as OrderInfo;
        return order;
    }
}

const saveOrder = (userId: string, orderId: string, channelPayId: string, optionIndex: number): OrderInfo => {
    if (userId == "") return { orderId: "", optionIndex: -1, channelPayId: "" };
    const order: OrderInfo = {
        orderId: orderId,
        optionIndex: optionIndex,
        channelPayId: channelPayId
    }
    localStorage.setItem(orderSaveKey(userId), JSON.stringify(order));
    return order;
}

const clearSavedOrder = (userId: string) => {
    if (userId == "") return;
    localStorage.removeItem(orderSaveKey(userId));
}

type RechargeOption = {
    diamond: number,
    price: number,
    price_off: number
}

const DashFunRecharge: FC<{ minRechargeValue: number, gameId: string }> = ({ minRechargeValue = 0, gameId = "" }) => {
    const [priceType, setPriceType] = useState(1);
    const [options, setOptions] = useState<RechargeOption[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    //当前选择的option的index，-1表示没选
    const [selected, setSelected] = useState<number>(-1);
    const initDataRaw = useSignal(initData.raw)
    const user = useDashFunUser();
    const platform = useRechargePlatform();
    const [purchasedOrder, setPurchasedOrder] = useState<any>(null);

    const [_1, _2, updateCoins, getCoinInfo] = useDashFunCoins();

    console.log("Recharge UI Opened, minRechargeValue:", minRechargeValue);

    const getRechargeOptions = async () => {
        // Fetch recharge options
        const result = await RechargeApi.getOptions(initDataRaw as string, platform);
        setPriceType(result.price_type);
        setOptions(result.options);

        const order = payingOrder(user?.id || "");
        if (order.orderId != "" && order.optionIndex >= 0) {
            checkSavedOrder(order);
        }
    }

    const checkSavedOrder = async (order: OrderInfo) => {
        setIsChecking(true);
        try {
            //const result = await RechargeApi.getOrder(order.orderId)
            //if (result.status <= RechargeOrderStatus.Paid) {
            setSelected(order.optionIndex);
            // } else {
            //     clearSavedOrder(user?.id || "");
            // }
        } finally {
            setIsChecking(false);
        }
    }

    useEffect(() => {
        getRechargeOptions();
    }, [])

    const diamondCoin = getCoinInfo("DashFunDiamond", "name");

    const headerHeight = 200;
    return <div id="recharge" className="w-full h-full items-center justify-start flex flex-col gap-2">
        <div className={"fixed flex flex-col items-center justify-center gap-2 w-full z-10 backdrop-blur-md max-w-screen-sm sm:aligen-center sm:mx-auto "}
            style={{ height: headerHeight, minHeight: headerHeight }}>
            <img src={diamondIcon} className='h-[100px] object-contain py-2' />
            <DFLabel>
                <div className="px-4 py-2">
                    <Text weight="2" className="text-white"><L langKey={LangKeys.Common_Balance} />:&nbsp;
                        {
                            //toCurrency(diamondCoin?.userData.amount || 0, 0)
                        }
                        <CountUp
                            from={diamondCoin?.userData.amount || 0}
                            to={(diamondCoin?.userData.amount || 0) +
                                (purchasedOrder && purchasedOrder.status == RechargeOrderStatus.Completed ? purchasedOrder.diamond : 0)}
                            separator=","
                            duration={1}
                        />
                    </Text>
                </div>
            </DFLabel>
            <Title className="text-white">
                {
                    minRechargeValue == 0 ?
                        <><L langKey={LangKeys.Common_Get} /> <L langKey={LangKeys.Common_DashFunDiamond} /></> :
                        <>{minRechargeValue} Diamonds Needed</>
                }

            </Title>
        </div>
        {options.length == 0 || isChecking ? <div className="w-full h-full items-center justify-center flex"
            style={{ paddingTop: headerHeight }}>
            <Spinner size={"l"} /></div> : null}

        <div className="flex w-full min-w-full overflow-x-hidden">
            <motion.div className="flex w-full h-full"
                animate={{ x: selected >= 0 ? "-100%" : "0" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                <div className="w-full min-w-full h-full p-4 overflow-y-auto "
                    style={{ paddingTop: headerHeight }} >
                    <RechargeList options={options} priceType={priceType} minRechargeValue={minRechargeValue} onClick={(_, index) => {
                        setSelected(index);
                    }} />
                </div>
                <div className="flex w-full min-w-full h-full p-4"
                    style={{ paddingTop: headerHeight }}>
                    <RechargeSelected
                        gameId={gameId}
                        optionIndex={selected}
                        option={selected >= 0 && options.length > 0 ? options[selected] : undefined}
                        priceType={priceType}
                        onBack={() => {
                            setSelected(-1);
                            updateCoins && updateCoins(["DashFun"]).then(() => {
                                setPurchasedOrder(null);
                            });
                        }}
                        onPurchase={(rechargeOrder) => {
                            setPurchasedOrder(rechargeOrder);
                        }}
                    />
                </div>
            </motion.div>
        </div>
    </div>
}

const RechargeSelected: FC<{
    gameId: string, optionIndex: number, option?: RechargeOption, priceType: number, onBack?: () => void, onPurchase?: (rechargeOrder: any) => void
}> = ({ gameId = "", optionIndex, option, priceType, onBack, onPurchase }) => {
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderInfo>();
    const initDataRaw = useSignal(initData.raw) as string
    const platform = retrieveLaunchParams().platform;
    const user = useDashFunUser();
    const [rechargeOrder, setRechargeOrder] = useState<RechargeOrder | null>(null);

    const orderRef = useRef(order);

    const finalPrice = calcFinalPrice(option?.price || 0, option?.price_off || 0);

    const checkOrderStatus = async () => {
        const order = orderRef.current;
        console.log("checking order status", order);
        if (order && order.orderId != "") {
            const result = await RechargeApi.getOrder(order?.orderId)
            if (result.status == RechargeOrderStatus.Completed
                || result.status == RechargeOrderStatus.Failed
                || result.status == RechargeOrderStatus.Canceled
            ) {
                setRechargeOrder(result);
                onPurchase && onPurchase(result);

                let currency = RechargePriceTypeText[result.price_type];
                let price = result.price;

                const item = new TopupItem(
                    "Diamond",
                    option?.diamond || 0,
                    price,
                    currency
                )

                UserRechargeEvent.fire(result.id, result.status == RechargeOrderStatus.Completed ? "success" : "canceled", result.pay_from, item);

                setTimeout(() => {
                    setLoading(false);
                    clearSavedOrder(user?.id || "");
                    setOrder(undefined);
                    setRechargeOrder(null);
                    onBack && onBack();
                }, 8000);
            }
        }
    }

    useEffect(() => {
        orderRef.current = order;
    }, [order])

    useEffect(() => {
        const order = payingOrder(user?.id || "");
        if (order.orderId != "" && order.optionIndex >= 0) {
            setLoading(true);
            setOrder(order);
        }
        checkOrderStatus();
        const interval = setInterval(() => {
            checkOrderStatus();
        }, 10000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        //rechargeOrder状态变化
    }, [rechargeOrder])

    useEffectOnActive(() => {
        if (isInDashFunApp() != null) {
            //在DashFun App环境下，需要重新按Purchase按钮
            setLoading(false);
        }
    }, [])

    const requestOrder = async () => {
        setLoading(true);
        try {
            const result = await RechargeApi.requestOrder(initDataRaw, gameId, platform, optionIndex);
            const currency = RechargePriceTypeText[priceType];
            UserRechargeEvent.fire(result.id, "pending", "", new TopupItem("Diamonds", option?.diamond || 0, finalPrice, currency));
            //保存正在进行的订单到本地
            const order = saveOrder(user?.id || "", result.id, result.payment_id, optionIndex);
            setOrder(order);

            if (isInTelegram() && result.price_type == RechargePriceType.TGSTAR) {
                //tg环境下直接请求开启invoice
                invoice.open(result.payment_id, "url").then((status) => {
                    if (status != "paid") {
                        cancelOrder();
                    }
                }).catch(e => {
                    console.error(e);
                    cancelOrder();
                });
            } else if (isInDashFunApp() != null) {
                //在DashFun App环境下，调用iap支付
                window.TelegramWebviewProxy?.postEvent("app_request_recharge", JSON.stringify(result));
            }

        } catch (e) {
            console.error(e);
        } finally {
            //setLoading(false);
        }
    }

    const cancelOrder = async () => {
        const order = orderRef.current;
        if (order && order.orderId != "") {
            RechargeApi.cancelOrder(initDataRaw, order?.orderId);
            const currency = RechargePriceTypeText[priceType];
            UserRechargeEvent.fire(order?.orderId, "canceled", "", new TopupItem("Diamonds", option?.diamond || 0, finalPrice, currency));
        }
        setLoading(false);
        clearSavedOrder(user?.id || "");
        setOrder(undefined);
        if (onBack) {
            onBack();
        }
    }

    const rechargeLink = RechargeLink.orderLink(order?.orderId || "");

    return <div className="w-full h-full items-center justify-start flex flex-col gap-2 pt-4">
        <Section disableDivider>
            <div className="w-full flex flex-row items-center justify-center py-2">
                <img src={diamondIcon} className="w-8" />
                <div className="px-2 flex flex-col items-start justify-center">
                    <div className="w-auto flex text-white items-center">
                        <L langKey={LangKeys.Common_Buy} />&nbsp;
                        <DFText size="xl" weight="2">{toCurrency(option?.diamond || 0, 0)}</DFText>&nbsp;
                        <L langKey={LangKeys.Common_DashFunDiamond} />
                    </div>
                    <p className="text-sm" style={{ color: "var(--tgui--hint_color)" }}>
                        <L langKey={LangKeys.Recharge_BuyDiamondSubTitle} />
                    </p>
                </div>
            </div>
            <div className="w-full flex flex-row items-center justify-center py-2">
                {priceType == RechargePriceType.USD && <DFText size="lg" weight="2">USD</DFText>}
                <DFText size="lg" weight="2">
                    {priceToString(finalPrice, priceType)}
                </DFText>
            </div>

            {
                //非tg环境下，非rn app环境下，或者充值金额不是star时，显示充值提示和链接
                (!isInTelegram() || priceType != RechargePriceType.TGSTAR) && isInDashFunApp() == null && rechargeOrder == null && order != null && order.orderId != "" && order.optionIndex >= 0 &&
                <div className="w-full flex flex-col items-center justify-center p-2 gap-3">
                    <DFText size="xs" weight="2"><L langKey={LangKeys.Recharge_Purchase_Link_Tip} /></DFText>
                    {
                        <a href={rechargeLink} target="_blank"><DFText size="xs" color="var(--tg-theme-link-color)" weight="1">{rechargeLink}</DFText></a>
                    }
                    <DFButton onClick={() => {
                        openLink(rechargeLink);

                    }}>Open Topup Link</DFButton>
                </div>
            }
            {
                rechargeOrder == null && <div className="w-full flex items-center justify-center py-3">
                    <DFButton size="m"
                        loading={loading}
                        disabled={loading}
                        onClick={() => {
                            requestOrder();
                        }}
                    ><L langKey={LangKeys.Common_Purchase} /></DFButton>
                    <Button onClick={() => cancelOrder()} mode="plain"><L langKey={LangKeys.Common_Cancel} /></Button>
                </div>
            }
            {
                rechargeOrder != null && <RechargeResult rechargeOrder={rechargeOrder} />
            }

        </Section>

    </div >
}

const RechargeResult: FC<{ rechargeOrder: any }> = ({ rechargeOrder }) => {
    return <div className="w-full h-full items-center justify-start flex flex-col gap-2 py-2">
        <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={rechargeOrder.status == RechargeOrderStatus.Completed ? aniSuccess : aniFailed}
            style={{ width: "150px" }}
        />
        <div className="w-full flex flex-col items-center justify-center p-2">
            <DFText size="sm" weight="2">{rechargeOrder.status == RechargeOrderStatus.Completed ? "Purchase Successful" : "Purchase Failed"}</DFText>
        </div>
    </div>
}

const RechargeList: FC<{
    options: RechargeOption[], priceType: number, minRechargeValue?: number,
    onClick?: (option: RechargeOption, index: number) => void
}> = ({ options, priceType, minRechargeValue = 0, onClick }) => {
    return <div className="w-full flex flex-col gap-3" >
        {
            options.map((option, index) => {
                if (option.diamond < minRechargeValue) {
                    return null;
                }
                return <div className="w-full" key={index}>
                    <RechargeItem option={option} priceType={priceType} onClick={() => {
                        if (onClick) {
                            onClick(option, index);
                        }
                    }} />
                </div>
            })
        }
    </div>
}

/**
 * off 折扣, 10 = 1% off
 * @param param0 
 * @returns 
 */
const RechargeItem: FC<{ option: RechargeOption, priceType: number, onClick: () => void }> = ({ option, priceType, onClick }) => {
    const { diamond, price, price_off: off } = option;
    const finalPrice = calcFinalPrice(price, off);

    return <DFCell className="w-full rounded-2xl relative" mode="primary"
        after={priceToString(finalPrice, priceType)}
        onClick={onClick}>
        {off >= 10 && <div className="absolute w-full h-full top-0 left-0 overflow-clip rounded-2xl">
            <div className="absolute px-3 pb-1 left-[-42px] top-[-10px] -rotate-45 flex flex-col items-center justify-end h-full font-semibold rounded-l-2xl w-[120px] bg-opacity-70 bg-red-400 text-white text-xs ">
                <p>{off / 10}%</p>
                OFF
            </div>
        </div>}
        <div className="w-full flex flex-row items-center pl-[45px]">
            <img src={diamondIcon} className="w-5" />
            <div className="pr-2 text-right font-semibold">{toCurrency(diamond, 0)}</div>
        </div>
    </DFCell>
}

// /**
//  * 显示指定数量的层叠diamond图标
//  * @param param0
//  * @returns
//  */
// const Diamonds: FC<{ count: number, size: number, width: number }> = ({count, size, width}) => {
//     return <div className="relative h-full flex flex-row items-center"
//         style={{ width: width }}>
//         {
//             Array.from({ length: count }).map((_, index) => {
//                 return <img key={index} src={diamondIcon} className="absolute" style={{
//                     width: size,
//                     right: index * 4
//                 }} />
//             })
//         }
//     </div>
// }

export default DashFunRecharge;