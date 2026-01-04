// js/status.js
import { API_URL, STATUS, USER_INTENT } from "./config.js";
import { updatePlayerInfo } from "./player.js";
import { log } from "./logger.js";
import { getState, setState, STATE } from "./state.js";
import { spinRefreshIcon } from "./dom.js";

export const CHECK_STATUS_CONFIG = {
    showLoading: true,
    showLog: true,
    updateState: true,
    updatePlayerInfo: true,
    manualRefresh: false,
}

/// Check the server status from the backend API
export async function checkStatus(configInput = CHECK_STATUS_CONFIG) {
    const { status, userIntent } = getState();

    const originalStatus = status;

    const config = { ...CHECK_STATUS_CONFIG, ...configInput };

    if (config.showLoading) {
        setState(STATE.STATUS, STATUS.LOADING);
        spinRefreshIcon();
    }

    if (config.updatePlayerInfo) await updatePlayerInfo();

    try {

        const res = await fetch(`${API_URL}?action=status`);
        if (!res.ok) throw new Error(`Status check failed: ${res.json().message || res.statusText}`);

        const data = await res.json();

        const hasChanged = data.status !== originalStatus;

        let message = data.message || `Status: ${data.originalStatus}`;
        let type = data.type || "info";
        let newStatus = data.status;

        //handle special case where server is booting, stopping or service unavailable
        if (data.status === STATUS.SERVICE_OFFLINE) {

            switch (userIntent) {

                case USER_INTENT.BOOTING:
                    message = "⏳ Server wird gestartet...";
                    type = "warn";
                    newStatus = STATUS.BOOTING;
                    break;

                case USER_INTENT.STOPPING:
                    message = "💤 Server wird gestoppt...";
                    type = "warn";
                    newStatus = STATUS.STOPPING;
                    break;

                default:
                    message = "⚠️ Server ist nicht erreichbar! Bitte Stoppen & Neustarten.";
                    type = "error";
                    newStatus = STATUS.SERVICE_OFFLINE;
                    break;

            }

        }

        if ((hasChanged && config.showLog) || config.manualRefresh) log(message, type);

        if (config.updateState) setState(STATE.STATUS, newStatus);

        return newStatus;

    } catch (err) {

        setState(STATE.STATUS, STATUS.ERROR);
        log(`Fehler beim Abrufen des Server-Status: ${err.message}`, "error");
        console.log(err);

        return STATUS.ERROR;
    }
}

export function forceRefresh() {
    const { status } = getState();

    if (status === STATUS.LOADING || status === STATUS.BOOTING || status === STATUS.STOPPING) return;

    log("Manuelles Update angefordert...");

    checkStatus({ manualRefresh: true });
}