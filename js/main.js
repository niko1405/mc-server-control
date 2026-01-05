// js/main.js
import { ACTION, IP } from "./config.js";
import { el, togglePassword } from "./dom.js";
import { log, clearLog, LOG_TYPE } from "./logger.js";
import { checkStatus, forceRefresh } from "./status.js";
import { triggerAction } from "./actions.js";
import { polling, resetActivityTimer } from "./polling.js";
import { copyIp } from "./utils.js";

// --- 1. Globale Listener (Inaktivitätstimer) ---
window.addEventListener('mousemove', resetActivityTimer);
window.addEventListener('keydown', resetActivityTimer);
window.addEventListener('click', resetActivityTimer);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resetActivityTimer();
});

// --- 2. Initiale UI Werte ---
el.ipLabel.textContent = IP;

// --- 3. Force Stop Logik & Visuals ---
const forceStopCheckbox = document.getElementById('forceStopCheckbox');
const stopButton = document.querySelector('.btn-stop');

// Feedback for Force Stop Checkbox
forceStopCheckbox.addEventListener('change', function () {
    if (this.checked) {
        stopButton.innerHTML = '<i class="fas fa-skull-crossbones"></i> FORCE STOP';
        stopButton.style.background = 'linear-gradient(135deg, #8b0000, #5a0000)';
        stopButton.style.boxShadow = '0 0 15px rgba(255, 0, 0, 1)';
        stopButton.title = "FORCE Stopp";
    } else {
        stopButton.innerHTML = '<i class="fas fa-stop"></i> Stoppen';
        stopButton.style.background = ''; 
        stopButton.style.boxShadow = '';
        stopButton.title = "Stoppen";
    }
});

// --- 4. Button Actions ---

// Start Button
document.querySelector(".btn-start").addEventListener("click", () => {
    triggerAction(ACTION.START);
});

stopButton.addEventListener("click", () => {
    const isForce = forceStopCheckbox.checked;
    
    triggerAction(isForce ? ACTION.FORCE_STOP : ACTION.STOP);
});

document.querySelector(".btn-clear").addEventListener("click", clearLog);
document.querySelector(".btn-refresh-top").addEventListener("click", forceRefresh);
document.getElementById("ipAddress").addEventListener("click", copyIp);
document.querySelector(".toggle-password").addEventListener("click", togglePassword);

// --- 5. Start ---
log("Willkommen im Minecraft Server Control Panel!", LOG_TYPE.SUCCESS);
checkStatus();
polling();