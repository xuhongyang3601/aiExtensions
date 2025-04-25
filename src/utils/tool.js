import { getGlobal, setGlobal } from "../utils/store";

/**
 * @description: 检查是否是一个有效的JSON字符串
 * @param {string} str
 * @return {*}
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * @description: 格式化查询字符串
 * @param {string} queryString
 * @return {*}
 */
export function queryStringToObject(queryString) {
  const urlParams = new URLSearchParams(queryString);
  const params = Object.create(null);

  urlParams.forEach((value, key) => {
    if (params[key] !== undefined) {
      if (!Array.isArray(params[key])) {
        params[key] = [params[key]];
      }
      params[key].push(value);
    } else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * @description: 判断当前浏览器是否是移动端
 * @return {boolean}
 */
export function isMobile() {
  const userAgent =
    navigator.userAgent || navigator.vendor || window.opera || "";
  const mobileRE =
    /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm|harmonyos(?!.*desktop)/i;
  const desktopRE = /harmonyos.*desktop/i;
  if (mobileRE.test(userAgent.toLowerCase())) {
    return true;
  } else if (desktopRE.test(userAgent.toLowerCase())) {
    return false;
  } else {
    return /mobile/i.test(userAgent.toLowerCase());
  }
}

function isChrome() {
  const win = window;
  const isChromium = win.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor === "";
  const isOpera = typeof win.opr !== "undefined";
  const isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  // Check if we are running in normal Chrome or Chromium Edge
  if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === true &&
    isIEedge === false &&
    isOpera === false
  ) {
    return true;
  }

  // Check if we are running in old Chromium Edge
  const isChromiumEdge = winNav.userAgent.indexOf("Edg/") > -1;
  if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    isChromiumEdge
  ) {
    return true;
  }

  // Check if we are running in old Google Chrome (Opera 15+ are fully compatible)
  const googleChrome =
    winNav.userAgent.indexOf("Chrome") > -1 &&
    winNav.userAgent.indexOf("Opera") === -1;
  if (googleChrome && !isChromiumEdge) {
    return true;
  }

  return false;
}

function is360Browser() {
  const userAgent = window.navigator.userAgent;
  return /360(se|browser) (turbo|急速) mode/i.test(userAgent);
}

//检测是否是谷歌或360浏览器,是返回true，否则返回false
export const isChromeAnd360Browser = () => {
  if (!isChrome() && !is360Browser()) {
    return false;
  }
  return true;
};
