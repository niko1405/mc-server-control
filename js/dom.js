import { STATUS } from "./config.js";
import { getState } from "./state.js";

// js/dom.js
export const el = {
    statusBadge: document.getElementById("statusBadge"),
    statusText: document.getElementById("statusText"),
    statusIcon: document.getElementById("statusIcon"),
    terminal: document.getElementById("terminal"),
    passwordInput: document.getElementById("passwordInput"),
    msgArea: document.getElementById("messageArea"),
    ipLabel: document.getElementById("ipAddress"),
    playerBox: document.getElementById("playerBox"),
    refreshIcon: document.getElementById("refreshIcon"),
    playerCount: document.getElementById("playerCount"),
    playerList: document.getElementById("playerList")
};

export function render() {
    //get data from state
    const state = getState();

    // A. Determine UI elements based on state
    let uiClass = 'status-offline';
    let uiIcon = 'fa-question-circle';
    let statusText = 'VERBINDE...';
    let showPlayers = false;

    switch (state.status) {
        case STATUS.LOADING:
            uiClass = 'status-working';
            uiIcon = 'fa-sync-alt fa-spin';
            statusText = 'LADE...';
            showPlayers = true;
            break;


        case STATUS.RUNNING:
            uiClass = 'status-running';
            uiIcon = 'fa-check-circle';
            statusText = 'SERVER ONLINE';
            showPlayers = true;
            break;


        case STATUS.STOPPED:
            uiClass = 'status-stopped';
            uiIcon = 'fa-stop-circle';
            statusText = 'SERVER OFFLINE';
            break;


        case STATUS.STOPPING:
            uiClass = 'status-stopping';
            uiIcon = 'fa-power-off fa-pulse';
            statusText = 'STOPPT...';
            break;

        case STATUS.BACKUPING:
            uiClass = 'status-working';
            uiIcon = 'fa-save fa-spin';
            statusText = 'BACKUP & SAVE...';
            break;


        case STATUS.BOOTING:
            uiClass = 'status-booting';
            uiIcon = 'fa-cog fa-spin';
            statusText = 'STARTET...';
            showPlayers = true;
            break;


        case STATUS.SERVICE_OFFLINE:
            uiClass = 'status-working';
            uiIcon = 'fa-exclamation-triangle';
            statusText = 'UNERREICHBAR';
            break;


        case STATUS.SLEEP:
            uiClass = 'status-sleep';
            uiIcon = 'fa-moon';
            statusText = 'PAUSE';
            break;

        default:
            uiClass = 'status-offline';
            uiIcon = 'fa-question-circle';
            statusText = 'FEHLER...';
    }

    // B. DOM Updates
    el.statusBadge.className = 'status-indicator ' + uiClass;
    el.statusIcon.className = 'fas ' + uiIcon;
    el.statusText.textContent = statusText;

    if(el.playerBox.classList.contains("hidden") && state.status === STATUS.LOADING) return; //avoid flicker

    el.playerBox.classList.toggle("hidden", !showPlayers);

    if (showPlayers) {
        //no data yet
        if (!state.mc_data.online) {
            el.playerList.innerHTML = '<span class="no-players" style="color:var(--accent-yellow)"><i class="fas fa-cog fa-spin"></i> Warte auf Dienst...</span>';
            el.playerCount.textContent = "0 / 0";
            return;
        }

        el.playerCount.textContent = `${state.mc_data.players.online} / ${state.mc_data.players.max}`;
        el.playerList.innerHTML = '';

        if(state.mc_data.players.online === 0) el.playerList.innerHTML = '<span class="no-players">Niemand da... 🦗</span>';

        if (state.mc_data.players.online > 0 && state.mc_data.players.list) {
            state.mc_data.players.list.forEach(p => {
                const span = document.createElement('span');
                span.className = 'player-badge';
                span.innerHTML = `<img src="https://minotar.net/avatar/${p.name}/20"> ${p.name}`;
                el.playerList.appendChild(span);
            });
        } 
    }
}


export function spinRefreshIcon() {
    el.refreshIcon.classList.add("fa-spin");
    setTimeout(() => el.refreshIcon.classList.remove("fa-spin"), 1000);
}

export function showErrorInput(msg) {
    el.passwordInput.classList.add('input-error');
    el.msgArea.textContent = msg;
    el.msgArea.classList.add('visible');
    setTimeout(() => {
        el.passwordInput.classList.remove('input-error');
        el.msgArea.classList.remove('visible');
    }, 2000);
}

export function togglePassword() {
    const icon = document.querySelector('.toggle-password');
    if (el.passwordInput.type === "password") {
        el.passwordInput.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        el.passwordInput.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}