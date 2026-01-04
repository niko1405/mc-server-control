// js/players.js
import { IP, MC_API_BaseURL, STATUS } from "./config.js";
import { getState, setState } from "./state.js";

export async function updatePlayerInfo() {
    const { status } = getState();
    if (status !== STATUS.RUNNING && status !== STATUS.BOOTING) return;

    try {
        const res = await fetch(`${MC_API_BaseURL}/${IP}?t=${Date.now()}`);
        const data = await res.json();

        const newMCData = {
            online: data.online,
            players: {
                online: data.players?.online || 0,
                max: data.players?.max || 0,
                list: data.players?.list || []
            }
        };

        setState(STATE.MC_DATA, newMCData);
    } catch (e) {
        console.warn("Error while trying to update player info with MC-API", e);
    }
}
