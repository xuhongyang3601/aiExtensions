import React, { useState, useEffect } from "react";
import Amis from "../components/Amis";
import { setChromeStore, getChromeStore } from "../utils/store";
import { defaultBaseUrl } from "../constants";
export default function Index() {
  console.log(getChromeStore("baseUrl"));
  const [baseUrl, setBaseUrl] = useState<string>("");
  useEffect(() => {
    getChromeStore("baseUrl").then((res) => {
      setBaseUrl(res || defaultBaseUrl);
    });
  }, []);
  if (!baseUrl) return <></>;
  return (
    <Amis
      schema={{
        type: "page",
        title: "迈越AI浏览器助手配置",
        body: [
          {
            type: "form",
            wrapWithPanel: false,
            body: [
              {
                type: "input-text",
                name: "baseUrl",
                label: "baseUrl",
                value: baseUrl,
              },
              {
                type: "button",
                label: "保存",
                level: "primary",
                size: "lg",
                block: true,
                onEvent: {
                  click: {
                    actions: [
                      {
                        actionType: "custom",
                        script: (context, doAction, event) => {
                          setChromeStore("baseUrl", event.data.baseUrl);
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      }}
    ></Amis>
  );
}
