// js/actions.js
import { ACTION, ACTION_TYPE, API_URL, STATUS, USER_INTENT } from "./config.js";
import { log, LOG_TYPE } from "./logger.js";
import { checkStatus } from "./status.js";
import { el, showErrorInput } from "./dom.js";
import { waitFor } from "./polling.js";
import { getState, setState, STATE } from "./state.js";
import { clearPlayerInfo } from "./player.js";

// === Action Trigger ===
export async function triggerAction(action) {
    setState(STATE.USER_INTENT, USER_INTENT.NONE);

    const password = el.passwordInput.value.trim();
    if (!password) { showErrorInput("Bitte Passwort eingeben!"); return; }

    const { status } = getState();

    const triesStopping = action.type === ACTION_TYPE.STOP || action.type === ACTION_TYPE.FORCE_STOP;

    //checks if trying to stop when service is unavailable
    const tryStopOnAvailable = (action.type === ACTION_TYPE.STOP || action.type === ACTION_TYPE.FORCE_STOP) && status === STATUS.SERVICE_OFFLINE;

    // avoid trying to start when service is unavailable
    if (status === STATUS.SERVICE_OFFLINE && action.type === ACTION_TYPE.START) {
        log("Der Server ist nicht erreichbar. Bitte versuche es später erneut.", LOG_TYPE.WARN);
        return;
    }

    if (status === STATUS.BOOTING || status === STATUS.STOPPING || status === STATUS.BACKUPING || status === STATUS.LOADING) {
        log("Bitte warte auf Abschluss des laufenden Prozesses...", LOG_TYPE.WARN);
        return;
    }

    if (triesStopping && status === STATUS.STOPPED) {
        log("Der Server ist bereits gestoppt.", LOG_TYPE.WARN);
        return;
    }

    if (action.type === ACTION_TYPE.START && status === STATUS.RUNNING) {
        log("Der Server läuft bereits.", LOG_TYPE.SUCCESS);
        return;
    }

    //pause polling
    setState(STATE.POLLING_PAUSED, true); 
    clearPlayerInfo();

    // Log action to terminal
    log(action.label, LOG_TYPE.INFO);

    setState(STATE.STATUS, action.status);

    //give user feedback when stopping as backup may take time
    if(action.type === ACTION_TYPE.STOP) {
        if(tryStopOnAvailable) log("Versuche, den Server zu erreichen...");
        
        log(action.warn, LOG_TYPE.WARN);
    }

    try {

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: action.type, password })
        });
        const data = await res.json();

        if (res.status === 401) {

            showErrorInput("Passwort falsch!");
            log("Passwort falsch!", LOG_TYPE.ERROR);
            log("Vorgang abgebrochen.", LOG_TYPE.ERROR);
            checkStatus({ showLoading: false, showLog: false });
            setState(STATE.POLLING_PAUSED, false);

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
                checkStatus({ showLoading: false, showLog: false });
                setState(STATE.POLLING_PAUSED, false);

                return;
            }

            log(data.message, LOG_TYPE.SUCCESS);

            switch (action.type) {

                case ACTION_TYPE.START:
                    log("VM fährt hoch. Bitte warten...");
                    waitFor(STATUS.RUNNING);
                    setState(STATE.USER_INTENT, USER_INTENT.BOOTING);
                    break;

                case ACTION_TYPE.STOP:
                    log("VM wird gestoppt. Bitte warten...");
                    setState(STATE.USER_INTENT, USER_INTENT.STOPPING);
                    setState(STATE.STATUS, STATUS.STOPPING);
                    setTimeout(() => waitFor(STATUS.STOPPED), 2000);
                    break;

                case ACTION_TYPE.FORCE_STOP:
                    log("VM wird gestoppt. Bitte warten...");
                    setState(STATE.USER_INTENT, USER_INTENT.STOPPING);
                    setState(STATE.STATUS, STATUS.STOPPING);
                    setTimeout(() => waitFor(STATUS.STOPPED), 2000);
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