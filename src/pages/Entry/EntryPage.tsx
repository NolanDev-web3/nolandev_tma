import { Env, getEnv } from '@/utils/DashFunApi';
import { channelSaveKey } from '@/utils/Utils';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const EntryPage: React.FC = () => {
    const nav = useNavigate();
    const { channel, to } = useParams<{ channel: string, to: string }>();
    const env = getEnv();
    const l = useLocation();
    const allowTest = env != Env.Prod;

    if (!allowTest && channel == "test") {
        return <div>Test is not allowed in production environment</div>;
    }

    useEffect(() => {
        if (allowTest || channel != "test") {
            let toPath = "";
            if (to == "" || to == null) {
                toPath = "/game-center"
            } else {
                toPath = "/" + to;
            }

            if (l.search != "") {
                toPath += l.search;
            }
            //save login channel
            localStorage.setItem(channelSaveKey(), channel || "");

            nav(toPath);
        }
    }, [channel, to]);

    return (
        <div>
        </div>
    );
};

export default EntryPage;