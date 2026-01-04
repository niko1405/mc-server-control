// js/logger.js
import { el } from "./dom.js";

export const LOG_TYPE = {
    INFO: "info",
    SUCCESS: "success",
    ERROR: "error",
    WARN: "warn"
};

export function log(msg, type = LOG_TYPE.INFO) {
    const now = new Date().toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement("div");
    entry.className = "log-entry";

    let iconHtml = '';
    if (type === LOG_TYPE.SUCCESS) iconHtml = '<i class="fas fa-check"></i> ';
    if (type === LOG_TYPE.ERROR) iconHtml = '<i class="fas fa-times"></i> ';
    if (type === LOG_TYPE.WARN) iconHtml = '<i class="fas fa-exclamation-triangle"></i> ';

    entry.innerHTML = `<span class="log-time">[${now}]</span><span class="log-${type}">${iconHtml}${msg}</span>`;

    el.terminal.appendChild(entry);
    el.terminal.scrollTop = el.terminal.scrollHeight;
}

export function clearLog() {
    el.terminal.innerHTML = "";
    log("Log wurde geleert.");
}