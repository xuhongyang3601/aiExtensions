import React from "react";
import { render as renderAmis, RenderOptions } from "amis";
import axios from "../utils/http";
import { queryStringToObject, isMobile } from "../utils/tool";
import { getGlobal } from "../utils/store";

export const fetcher = ({
  url, // 接口地址
  method, // 请求方法 get、post、put、delete
  data, // 请求数据
  responseType,
  config, // 其他配置
  headers, // 请求头
}) => {
  config = config || {};
  responseType && (config.responseType = responseType);

  if (config.cancelExecutor) {
    config.cancelToken = new axios.CancelToken(config.cancelExecutor);
  }

  config.headers = headers || {};

  if (method !== "post" && method !== "put" && method !== "patch") {
    if (data) {
      config.params = data;
    }

    return axios[method](url, config);
  } else if (data && data instanceof FormData) {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "multipart/form-data";
  } else if (
    data &&
    typeof data !== "string" &&
    !(data instanceof Blob) &&
    !(data instanceof ArrayBuffer)
  ) {
    data = JSON.stringify(data);
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";
  }
  return axios[method](url, data, config);
};

export default function Amis(props) {
  let { schema, schemaUrl, theme = "cxd", ...resetProps } = props;
  const queryParams = queryStringToObject(location.search) || {};
  const context = {
    CONTEXT_ROOT: getGlobal("baseUrl"),
    ...queryParams,
  };
  return renderAmis(
    {
      type: "service",
      className: props.className || "h-full",
      data: context,
      body: schema,
    },
    {
      ...resetProps,
      location,
    },
    {
      fetcher,
      isCancel: (value) => axios.isCancel(value),
      theme,
      isMobile: () => {
        return isMobile();
      },
    }
  );
}
