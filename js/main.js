// js/main.js
import { ACTION, IP } from "./config.js";
import { el, togglePassword } from "./dom.js";
import { log, clearLog } from "./logger.js";
import { checkStatus, forceRefresh } from "./status.js";
import { triggerAction } from "./actions.js";
import { polling, resetActivityTimer } from "./polling";
import { copyIp } from "./utils.js";

window.addEventListener('mousemove', resetActivityTimer);
window.addEventListener('keydown', resetActivityTimer);
window.addEventListener('click', resetActivityTimer);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resetActivityTimer();
});

el.ipLabel.textContent = IP;

document
    .querySelector(".btn-start")
    .addEventListener("click", () => triggerAction(ACTION.START));

document
    .querySelector(".btn-stop")
    .addEventListener("click", () => triggerAction(ACTION.STOP));

document
    .querySelector(".btn-clear")
    .addEventListener("click", clearLog);

document
    .querySelector(".btn-refresh-top")
    .addEventListener("click", forceRefresh);

document
    .getElementById("ipAddress")
    .addEventListener("click", copyIp);

document.querySelector(".toggle-password").addEventListener("click", togglePassword);

log("Willkommen zum Minecraft Server Control Panel!");
checkStatus();
polling();
