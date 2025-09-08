import DashFunRecharge from "@/components/DashFunRecharge/DashFunRecharge";
import { L, LangKeys } from "@/components/Language/Language";
import { isInDashFunApp, isInTelegram } from "@/utils/Utils";
import { Button } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const GameCenter_RechargePage: FC = () => {
    const nav = useNavigate();
    return <div id="RechargePage" className="w-full h-full flex flex-col p-4">
        {!isInTelegram() && isInDashFunApp() == null &&
            <div className='p-4 fixed z-20'>
                <Button mode="plain" onClick={() => { nav(-1) }}>
                    <L langKey={LangKeys.Common_Back} />
                </Button>
            </div>
        }
        {/* 平台充值,gameId="" */}
        <DashFunRecharge minRechargeValue={0} gameId="" />
    </div>
}

export default GameCenter_RechargePage;