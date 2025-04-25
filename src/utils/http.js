import axios from "axios";
import { toast } from "amis-ui";
import { setStore, getStore, clearStore, getGlobal } from "../utils/store";

// 根据环境变量设置baseUrl
export const baseUrl =
  import.meta.env.MODE === "development"
    ? "/devApi"
    : "http://172.18.0.66/dianda";
axios.defaults.baseURL = baseUrl;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 1000 * 60 * 10; // 10 分钟

// 获取当前活动标签页的Cookie
function getActiveTabCookie(callback) {
  // 获取当前活动的标签页
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const currentTab = tabs[0];
      const url = new URL(currentTab.url);

      // 获取当前标签页的access_token cookie
      chrome.cookies.get(
        {
          url: currentTab.url,
          name: "access_token",
        },
        function (cookie) {
          if (cookie) {
            callback(cookie.value);
          } else {
            // 如果没有找到cookie，尝试从URL参数获取
            const urlParams = new URLSearchParams(url.search);
            const tokenFromUrl = urlParams.get("access_token");
            callback(tokenFromUrl);
          }
        }
      );
    } else {
      callback(null);
    }
  });
}

function response401Handler(response) {
  clearStore("uisAccessToken");
  return response;
}

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    let url = config.url;
    if (url.startsWith("/dianda")) {
      config.url = url.replace("/dianda", "");
    }

    return new Promise((resolve) => {
      getActiveTabCookie((cookieToken) => {
        let token = getStore("uisAccessToken");
        // 如果是从标签页获取的新token，保存到本地存储
        if (cookieToken && cookieToken !== getStore("uisAccessToken")) {
          setStore("uisAccessToken", cookieToken);
          token = cookieToken;
        }
        if (token && !config.headers.Authorization ) {
          config.headers.Authorization = "Bearer " + token;
        }

        resolve(config);
      });
    });
  },
  (err) => {
    return Promise.reject(err);
  }
);

// 响应拦截器即异常处理
axios.interceptors.response.use(
  async (response) => {
    // 接口返回状态码处理
    if (response.status === 200 || response.status == "304") {
      return response;
    }
  },
  async (error) => {
    // 请求报错处理
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          return response401Handler(error.response);
          break;
        case 404:
          // toast.error("你所访问的页面不存在");
          break;
        case 400:
          toast.error(error.response.data.msg ? error.response.data.msg : "");
          break;
        case 500:
        case 503:
        case 504:
          toast.error("连接服务器失败,请稍后重试");
          break;
        default:
          return Promise.reject(error);
          break;
      }
    }
    return Promise.reject((error.response && error.response.data.msg) || error);
  }
);

export default axios;
