import { FAST_POLLING_INTERVAL, IDLE_TIMEOUT, IP, NORMAL_POLLING_INTERVAL, STATUS } from "./config.js";
import { clearLog, log, LOG_TYPE } from "./logger.js";
import { getState, setState, STATE } from "./state.js";
import { CHECK_STATUS_CONFIG, checkStatus } from "./status.js";

let pollingIntervalId = null;

// === AUTO REFRESH LOOP ===
export function polling(showStartMsg = true) {

    if (pollingIntervalId) clearInterval(pollingIntervalId);
    pollingIntervalId = null;

    if (showStartMsg) log("Starte Auto-Refresh (alle 30s)");

    pollingIntervalId = setInterval(() => {

        const { lastActivityTime, pollingPaused } = getState();

        if (Date.now() - lastActivityTime > IDLE_TIMEOUT) {

            clearLog();
            log("Inaktivität erkannt. Auto-Update pausiert.");
            setState(STATE.STATUS, STATUS.SLEEP);
            clearInterval(pollingIntervalId);

            return;
        }

        // check status
        if (!pollingPaused && !document.hidden) checkStatus();

    }, NORMAL_POLLING_INTERVAL);
}

// --- Monitoring (Wait for Backend Status Confirmation) ---
export function waitFor(targetStatus) {
    if (pollingIntervalId) clearInterval(pollingIntervalId);

    log(`Warte auf Status: ${targetStatus.toUpperCase()}...`, LOG_TYPE.WARN);

    // Fast Polling every 3 seconds
    pollingIntervalId = setInterval(async () => {
        const status = await checkStatus({ showLoading: false, showLog: false, updateState: false, updatePlayerInfo: false });

        if (status === STATUS.ERROR) return;

        if (status === targetStatus) {

            clearInterval(pollingIntervalId);
            setState(STATE.POLLING_PAUSED, false);
            setState(STATE.USER_INTENT, STATE.USER_INTENT.NONE);

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
    const { status } = getState();

    setState(STATE.LAST_ACTIVITY_TIME, Date.now());

    if (status === STATUS.SLEEP) {

        log("Aktivität erkannt. Auto-Update fortgesetzt.");
        setState(STATE.STATUS, STATUS.LOADING);
        setState(STATE.POLLING_PAUSED, false);

        //manual check status once
        checkStatus();

        polling();

    }
}

export function checkPolling() {
    const { status } = getState();

    if (status === STATUS.BOOTING || status === STATUS.STOPPING) return;

    if (!pollingIntervalId) polling();
}