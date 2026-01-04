import { el } from "./dom.js";
import { LOG_TYPE } from "./logger.js";

export function copyIp() {
    navigator.clipboard.writeText(IP).then(() => {
        log("IP Adresse kopiert!", LOG_TYPE.SUCCESS);
        const original = el.ipLabel.textContent;
        el.ipLabel.textContent = "Kopiert!";
        setTimeout(() => el.ipLabel.textContent = original, 1000);
    });
}