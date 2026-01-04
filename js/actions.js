// js/actions.js
import { ACTION, API_URL, STATUS } from "./config.js";
import { log, LOG_TYPE } from "./logger.js";
import { checkStatus } from "./status.js";
import { el, showErrorInput } from "./dom.js";
import { waitFor } from "./polling.js";
import { getState, setState, STATE } from "./state.js";

// === Action Trigger ===
export async function triggerAction(action) {
    setState(STATE.USER_INTENT, USER_INTENT.NONE);

    const password = el.passwordInput.value.trim();
    if (!password) { showErrorInput("Bitte Passwort eingeben!"); return; }

    const { status } = getState();

    if (status === STATUS.BOOTING || status === STATUS.STOPPING || status === STATUS.BACKUPING || status === STATUS.LOADING) {
        log("Bitte warte auf Abschluss des laufenden Prozesses...", LOG_TYPE.WARN);
        return;
    }

    if (action === ACTION.STOP && status === STATUS.STOPPED) {
        log("Der Server ist bereits gestoppt.", LOG_TYPE.WARN);
        return;
    }

    if (action === ACTION.START && status === STATUS.RUNNING) {
        log("Der Server läuft bereits.", LOG_TYPE.SUCCESS);
        return;
    }

    // Pause polling while action is in progress
    setState(STATE.POLLING_PAUSED, true);

    if (action === ACTION.STOP) {
        log(`🛑 Sende Stopp-Signal...`, LOG_TYPE.WARN);
        log(`⏳ <b>BACKUP LÄUFT...</b> Bitte warten! (Dauert ca. 70s)`, LOG_TYPE.INFO);
        setState(STATE.STATUS, STATUS.BACKUPING);
    } else {
        log(`🚀 Sende Start-Signal...`, LOG_TYPE.INFO);
        setState(STATE.STATUS, STATUS.BOOTING);
    }

    try {

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, password })
        });
        const data = await res.json();

        if (res.status === 401) {

            showErrorInput("Passwort falsch!");
            log("Passwort falsch!", LOG_TYPE.ERROR);
            setState(STATE.POLLING_PAUSED, false);
            checkStatus({ showLoading: false, showLog: false });

            return;
        }

        if (!res.ok) {

            log(`Fehler: ${data.message}`, LOG_TYPE.ERROR);
            setState(STATE.STATUS, STATUS.ERROR);
            setState(STATE.POLLING_PAUSED, false);

            return;
        }

        if (res.ok) {

            if (data.status.includes('already')) {

                log(data.message, LOG_TYPE.WARN);
                setState(STATE.POLLING_PAUSED, false);
                checkStatus({ showLoading: false, showLog: false });

                return;
            }

            log(data.message, LOG_TYPE.SUCCESS);

            switch (action) {

                case ACTION.START:
                    log("VM fährt hoch. Bitte warten...");
                    waitFor(STATUS.RUNNING);
                    setState(STATE.USER_INTENT, USER_INTENT.BOOTING);
                    break;

                case ACTION.STOP:
                    log("VM wird gestoppt. Bitte warten...");
                    setTimeout(() => waitFor(STATUS.STOPPED), 2000);
                    setState(STATE.USER_INTENT, USER_INTENT.STOPPING);
                    break;

            }

        }

    } catch (err) {

        log("Netzwerkfehler: " + err.message, LOG_TYPE.ERROR);
        setState(STATE.STATUS, STATUS.ERROR);
        setState(STATE.POLLING_PAUSED, false);
        console.log(err.message);
        
    }
}