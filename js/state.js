import { STATUS, USER_INTENT } from "./config.js";
import { render } from "./dom.js";

export const STATE = {
  STATUS: "status",
  USER_INTENT: "userIntent",
  IS_NETWORK_BUSY: "isNetworkBusy",
  MC_DATA: "mc_data",
  LAST_ACTIVITY_TIME: "lastActivityTime",
  POLLING_PAUSED: "pollingPaused"
};

// js/state.js
const state = {
  status: STATUS.LOADING,
  userIntent: USER_INTENT.NONE,
  isNetworkBusy: false,
  mc_data: { online: false, players: { online: 0, max: 0, list: [] } },
  lastActivityTime: Date.now(),
  pollingPaused: false
};

export function getState() {
  return { ...state }; // Kopie (read-only)
}

export function setState(key, value) {
  if (!(key in state)) {
    console.warn(`Unknown State-Key: ${key}`);
    return;
  }
  state[key] = value;

  render();
}
