// js/config.js
export const API_URL =
  "https://mc-server-func-fsg8bvbfh2fyaec8.norwayeast-01.azurewebsites.net/api/mc-vm-control";

export const IP = "4.219.14.199";

export const MC_API_BaseURL = "https://api.mcsrvstat.us/3";
export const MC_AVATAR_URL = "https://minotar.net/avatar";

export const STATUS = {
  RUNNING: "running",
  STOPPED: "stopped",
  STOPPING: "stopping",
  BACKUPING: "backupping",
  BOOTING: "booting",
  LOADING: "loading",
  SLEEP: "sleep",
  SERVICE_OFFLINE: "service_offline",
  ERROR: "error"
};

export const ACTION_TYPE = {
  START: "start",
  STOP: "stop",
  FORCE_STOP: "forcestop",
};

export const ACTION = {
  START: { type: ACTION_TYPE.START, label: "🚀 Sende Start-Signal...", warn: "", status: STATUS.BOOTING },
  STOP: { type: ACTION_TYPE.STOP, label: "🛑 Sende Stopp-Signal...", warn: "⏳ <b>Frage BACKUP an...</b> Dies kann einige Zeit dauern. Bitte warten!", status: STATUS.BACKUPING },
  FORCE_STOP: { type: ACTION_TYPE.FORCE_STOP, label: "💀 Sende FORCE STOP Signal...", warn: "Achtung: Dies kann zu Datenverlust führen!", status: STATUS.STOPPING },
};

export const USER_INTENT = {
  BOOTING: "booting",
  STOPPING: "stopping",
  NONE: "none",
};

export const IDLE_TIMEOUT = 5 * 60 * 1000;

export const NORMAL_POLLING_INTERVAL = 30 * 1000;
export const FAST_POLLING_INTERVAL = 3 * 1000;