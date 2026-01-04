import { ACTION, FAST_POLLING_INTERVAL, IDLE_TIMEOUT, NORMAL_POLLING_INTERVAL, STATUS } from "./config";
import { setStatusUI } from "./dom";
import { log, LOG_TYPE } from "./logger";
import { getState, setState, STATE } from "./state";
import { checkStatus } from "./status";

let pollingIntervalId = null;

// === AUTO REFRESH LOOP ===
export function polling(showStartMsg = true) {
    const { lastActivityTime, pollingPaused } = getState();

    if (pollingPaused) return;

    if (pollingIntervalId) clearInterval(pollingIntervalId);

    if(showStartMsg) log("Starte Auto-Refresh (alle 30s)");

    pollingIntervalId = setInterval(() => {
        
        if (Date.now() - lastActivityTime > IDLE_TIMEOUT) {

            log("Inaktivität erkannt. Auto-Update pausiert.");
            setState(STATE.STATUS, STATUS.SLEEP);
            clearInterval(pollingIntervalId);

            return;
        }

        // check status
        if(!pollingPaused && !document.hidden) checkStatus();

    }, NORMAL_POLLING_INTERVAL);
}

// --- Monitoring (Wait for Backend Status Confirmation) ---
export function waitFor(targetStatus) {
    if (pollingIntervalId) clearInterval(pollingIntervalId);

    log(`Warte auf Status: ${targetStatus.toUpperCase()}...`, LOG_TYPE.WARN);

    // Fast Polling every 3 seconds
    pollingIntervalId = setInterval(async () => {
        const status = await checkStatus(false, true);

        if(status === STATUS.ERROR) return;

        if (status === targetStatus) {

            clearInterval(pollingIntervalId);
            setState(STATE.POLLING_PAUSED, false);

            switch (targetStatus) {

                case STATUS.RUNNING:
                    setState(STATE.STATUS, STATUS.RUNNING);
                    log(`🚀 Start abgeschlossen!`, LOG_TYPE.SUCCESS);
                    log(`👉 <b>Joine jetzt: ${IP}</b>`);
                    break;

                case STATUS.STOPPED:
                    setState(STATE.STATUS, STATUS.STOPPED);
                    log("Server ist nun OFFLINE.", LOG_TYPE.ERROR);
                    break;

            }

            // start polling again
            polling(false);

        }
    }, FAST_POLLING_INTERVAL);
}

export function resetActivityTimer() {
    setState(STATE.LAST_ACTIVITY_TIME, Date.now());

    log("Aktivität erkannt. Auto-Update fortgesetzt.");

    polling();
}