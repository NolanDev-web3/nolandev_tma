import { GameData } from "@/components/DashFunData/GameData"
import { DashFunUser } from "@/components/DashFunData/UserData"
import { GameDataLoadedEvent, UserLoginEvent } from "@/components/Event/Events"
//没用友盟
const umeng: { user: DashFunUser | null, game: GameData | null } = {
    user: null,
    game: null
}

const umengInit = () => {
    UserLoginEvent.addListener(onUserLogin)
    GameDataLoadedEvent.addListener(onGameDataLoaded)
}

const onUserLogin = (user: DashFunUser) => {
    const { aplus_queue } = window;
    aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_user_id', user.id]
    });

    aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_hold', 'START']
    });

    umeng.user = user
}

const onGameDataLoaded = (game: GameData) => {
    umeng.game = game
    const { aplus_queue } = window;
    aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['globalproperty', { game_id: game.id, game_name: game.name }]
    });
}

export { umengInit }