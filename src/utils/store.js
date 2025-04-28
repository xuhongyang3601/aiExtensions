// @ts-nocheck
import { isValidJSON } from "./tool";
import { guid } from "amis-core";
import cloneDeep from "lodash/cloneDeep";

const globalData = {};

window.maiyueSoftGlobalData = globalData;
export function setStore(key, value) {
  localStorage.setItem(
    key,
    typeof value == "object" ? JSON.stringify(value) : value
  );
}

export function clearStore(key) {
  localStorage.removeItem(key);
}

export function getStore(key) {
  let value = localStorage.getItem(key);

  if (value && isValidJSON(value)) {
    value = JSON.parse(value);
  }

  return value;
}

export function setSessionStore(key, value) {
  sessionStorage.setItem(
    key,
    typeof value == "object" ? JSON.stringify(value) : value
  );
}

export function getSessionStore(key) {
  let value = sessionStorage.getItem(key);

  if (value && isValidJSON(value)) {
    value = JSON.parse(value);
  }

  return value;
}

export function setGlobal(key, value) {
  globalData[key] = value;
}

export function getGlobal(key) {
  const value = globalData[key];

  return value;
}

export function setChromeStore(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve();
    });
  });
}

export function getChromeStore(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key]);
    });
  });
}
