// js/status.js
import { API_URL, STATUS } from "./config.js";
import { updatePlayerInfo } from "./players.js";
import { log } from "./logger.js";
import { getState, setState, STATE } from "./state.js";
import { spinRefreshIcon } from "./dom.js";

/// Check the server status from the backend API
export async function checkStatus(showLoading = true, fast_checking = false) {

    if (showLoading) {
        setState(STATE.STATUS, STATUS.LOADING);
        spinRefreshIcon();
    }

    if(!fast_checking) await updatePlayerInfo();

    try {

        const res = await fetch(`${API_URL}?action=status`);
        if (!res.ok) throw new Error(`Status check failed: ${res.json().message || res.statusText}`);

        const data = await res.json();
        const { status, userIntent } = getState();

        const hasChanged = data.status !== status;

        let message = data.message || `Status: ${data.status}`;
        let type = data.type || "info";
        let newStatus = data.status;

        //handle special case where server is booting, stopping or service unavailable
        if (data.status === STATUS.SERVICE_OFFLINE) {

            switch (userIntent) {

                case STATUS.BOOTING:
                    message = "⏳ Server wird gestartet...";
                    type = "warn";
                    newStatus = STATUS.BOOTING;
                    break;

                case STATUS.STOPPING:
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

        if (hasChanged && !fast_checking) log(message, type);

        if(!fast_checking) setState(STATE.STATUS, newStatus);

        return newStatus;

    } catch (err) {

        setState(STATE.STATUS, STATUS.ERROR);
        log(`Fehler beim Abrufen des Server-Status: ${err.message}`, "error");
        console.log(err);

        return STATUS.ERROR;
    }
}

export function forceRefresh() {
    log("Manuelles Update angefordert...");

    checkStatus();
}