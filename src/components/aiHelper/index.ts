import Drawer from "./drawer";
import { Schema } from "amis-core";

import chatContent from "./chatContent";
import eventHandler from "../eventHandler";

let jsonData: Schema = {
  type: "page",
  initApi: "/ai/assistant/setting/get",
  showErrorMsg: false,
  id: "ai-helper-page",
  className: {
    "ai-page": true,
    "digital-human": "${digitalHuman}",
  },
  asideClassName: "ai-page-aside",
  bodyClassName: "ai-page-body",
  css: {
    ".visibleHidden": {
      visibility: "hidden",
    },
    ".noAfter::after": {
      display: "none",
    },
    ".noBefore::before": {
      display: "none",
    },
    ".hideScrollbar::-webkit-scrollbar": {
      display: "none",
    },
    ".historyHideScrollbar": {
      padding: "0px",
    },
    ".ai-page": {
      height: "100%",
      background: "linear-gradient(180deg, #5688F7 0%, #F6F7FB 40%) !important",
      "--h-head": "38px",
      "--h-foot": "88px",
      "font-size": "15px",
    },
    ".ai-page-body": {
      padding: "0",
      height: "100%",
    },
    ".ai-view": {
      height: "100%",
      display: "flex",
      "flex-direction": "column",
    },
    ".ai-view .player-wrapper": {
      height: "100%",
      width: "100%",
      position: "fixed",
      top: "0",
      left: "0",
    },
    ".ai-view .ai-header": {
      height: "var(--h-head)",
      width: "100%",
      "z-index": "1",
      color: "#fff",
    },
    ".ai-view .ai-body": {
      width: "100%",
      "flex-grow": "1",
      height: "0",
    },
    ".ai-view .ai-foot": {
      "min-height": "var(--h-foot)",
      width: "100%",
      "background-color": "#fff",
      "box-shadow": "0px 0px 10px 0px rgba(0,0,0,0.02)",
    },
    ".message-wrapper": {
      "overflow-y": "auto",
      height: "100%",
      padding: "14px",
    },
    ".suggestion": {
      "max-width": "1000px",
      margin: "0 auto",
      "border-radius": "8px",
      background: "#fff",
      padding: "24px",
      "margin-top": "30px",
    },
    ".suggestion-box": {
      display: "grid",
      "grid-template-columns": "repeat(1, 1fr)",
      "row-gap": "12px",
      "column-gap": "14px",
    },
    ".suggestion-box-item": {
      display: "block",
      height: "40px",
      "background-color": "#F7F9FD",
      "border-radius": "4px",
      cursor: "pointer",
      padding: "0 10px",
    },
    ".suggestion-box-item-container": {
      width: "100%",
      height: "100%",
      display: "inline-block",
      "text-align": "left",
      "line-height": "40px",
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    },
    ".icon-0": {
      color: "#F4645D",
    },
    ".icon-1": {
      color: "#ED793D",
    },
    ".icon-2": {
      color: "#F1A759",
    },
    ".icon-3": {
      color: "#B4B4B4",
    },
    ".chat-input": {
      padding: "4px",
      overflow: "hidden",
      "border-radius": "16px",
      "background-color": "#F7F8FA !important",
    },
    ".chat-input div": {
      "background-color": "#F7F8FA !important",
    },
    ".chat-input textarea::-webkit-scrollbar": {
      display: "none",
    },
    ".chat-input textarea": {
      flex: "1",
      "background-color": "#F7F8FA !important",
      resize: "none",
      padding: "0 30px 0 5px !important",
      border: "none",
      outline: "medium",
    },
    ".chat-input >div >div >div": {
      padding: "0 40px 0 0 !important",
    },
    ".ai-page .ai-page-body .chat-input input,input:focus,.ai-page .ai-page-body .chat-input textarea,.ai-page .ai-page-body .chat-input textarea:focus":
      {
        "font-size": "16px !important",
      },
    ".chat-input .is-disabled textarea ~span": {
      background: "var(--Form-input-onDisabled-bg)",
    },
    ".file-upload .input-file": {
      padding: "0 !important",
    },
    ".file-upload .input-file .file-control-list": {
      "margin-bottom": "0 !important",
    },
    ".search-wrapper": {
      margin: "24px 0 12px",
      "border-top": "1px solid #E8EFFA",
      "border-bottom": "1px solid #E8EFFA",
    },
    ".search-wrapper .keywords >div >div": {
      "background-color": "transparent",
    },
    ".list-wrapper-items": {
      padding: "0 10px",
      position: "relative",
      overflow: "hidden",
      "border-radius": "4px",
      "text-align": "justify",
      display: "flex",
      "align-items": "center",
    },
    ".list-wrapper-items.active": {
      "background-color": "rgba(131,128,153,.12)",
    },
    ".collapse-group .collapse-item": {
      "border-width": "0",
    },
    ".collapse-item >div:first-of-type": {
      "padding-top": "0",
      "padding-bottom": "0",
    },
    ".collapse-item div": {
      "background-color": "transparent",
    },
    ".collapse-item >div:first-of-type >span": {
      "margin-top": "10px !important",
    },
    ".icon-commenting": {
      "font-size": "22px",
    },
    ".list-name": {
      flex: "1",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
      width: "100%",
      "line-height": "38px",
      overflow: "hidden",
      cursor: "pointer",
    },
    ".ellipsis-btn": {
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
      position: "absolute",
      height: "100%",
      padding: "0 6px",
      top: "0",
      right: "0",
      "background-image":
        "linear-gradient(90deg, hsla(0, 0%, 100%, 0), #fff 12%)",
    },
    ".new-btn": {
      border: "1px solid",
      "border-radius": "4px",
      color: "var(--primary)",
      "text-align": "center",
    },
    ".keywords": {
      padding: " 2px 0",
    },
    ".input-wrapper": {
      display: "flex",
      "align-items": "center",
      position: "relative",
      color: "#333333",
    },
    ".input-wrapper >form": {
      flex: "1",
    },
    ".input-wrapper >i": {
      "font-size": "24px",
    },
    ".file-add": {
      position: "absolute",
      right: "38px",
    },
    ".voice-wrapper": {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
    },
    ".microphone-wrapper": {
      width: "50px",
      height: "50px",
      padding: "0",
      "align-items": "center",
      display: "flex",
      "justify-content": "center",
      "border-radius": "100%",
      "background-color": "rgba(131,128,153,.12)",
    },
    ".bbx,.bbx >div": {
      "background-image": "linear-gradient(180deg, #5688F7 0%, #F6F7FB 40%)",
    },
    ".bbx-item": {
      padding: "10px",
      width: "calc(50% - 10px)",
      margin: "5px",
    },
    ".tab-content-transparent": {
      "background-color": "transparent",
    },
    ".more-agent": {
      "margin-left": "34px",
    },
    ".digital-human-player": {
      height: "100%",
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    },
    ".digital-human-player >div": {
      height: "100%",
      width: "100%",
    },
    ".digital-human-player .video-react-video": {
      "object-fit": "cover",
    },
    ".digital-human-player .video-react": {
      height: "100%",
    },
    ".digital-human-player .video-react-button,.video-react-control-bar,.video-react-loading-spinner":
      {
        display: "none !important",
      },
    ".answer-dialog img": {
      "max-width": "100% !important",
    },
    ".answer-dialog table": {
      "max-width": "100% !important",
    },
    ".tab-links li:not(.is-active) a, .sub-tab-links li:not(.is-active) a": {
      color: "rgba(255,255,255,0.7) !important",
    },
    ".tab-links a": {
      "font-size": "18px !important",
    },
    ".tab-links .is-active a": {
      color: "rgba(255,255,255) !important",
      border: "none !important",
      "font-weight": "500 !important",
    },
    ".prolusion-tabs-links .is-active a": {
      color: "#333333 !important",
      "font-size": "16px !important",
      "font-weight": "500",
      border: "none !important",
      position: "relative",
    },
    ".prolusion-tabs-links .is-active a:after": {
      content: "''",
      position: "absolute",
      bottom: "0",
      left: "50%",
      "margin-left": "-14px",
      width: "28px",
      height: "4px",
      "border-radius": "999px",
      "background-color": "#5789F7",
    },
    ".prolusion-tabs-links": {
      "margin-bottom": "18px",
    },
    ".prolusion-tabs-links a": {
      color: "#666 !important",
      "font-size": "15px !important",
    },
    ".sub-tab-links .is-active a": {
      color: "rgba(255,255,255) !important",
      "font-weight": "500 !important",
      "border-color": "#fff !important",
    },
    ".tab-links": {
      "justify-content": "center",
    },
    ".bbx-tabs >div:first-of-type:before, .sub-tabs >div:first-of-type:before, .prolusion-tabs >div:first-of-type:before":
      {
        display: "none",
      },
    ".sub-tab-content": {
      "margin-top": "20px",
    },
    ".input-connection": {
      "box-shadow": "0px 0px 20px 0px rgba(0,72,167,0.1)",
    },
    ".input-agents": {
      position: "absolute",
      bottom: "0",
      width: "100%",
      "margin-bottom": "unset",
      border: "unset",
      "border-bottom": "1px solid rgb(246, 246, 246)",
      "border-radius": "8px 8px 0 0",
      "max-height": "100%",
      "overflow-y": "auto",
    },
    ".input-agents-list": {
      padding: "12px !important",
    },
    ".input-agents-list-item": {
      display: "block !important",
      background: "#F7F9FD",
      padding: "10px",
      "border-radius": "8px",
    },
    ".input-agents-list-item:not(:last-child)": {
      "margin-bottom": "6px",
    },
    ".input-agents-list-item:last-child": {
      "margin-bottom": "0",
    },
    ".input-agents-list-item-right": {
      "white-space": "nowrap",
      overflow: "hidden",
      "text-overflow": "ellipsis",
    },
    ".current-agent": {
      background: "#F5F5F8",
      display: "flex",
      "justify-content": "space-between",
      margin: "-12px -12px 12px",
      padding: "6px 12px",
      "line-height": "0",
      color: "#B3B6CB",
      "box-shadow": "0px 0px 20px 0px rgba(0,72,167,0.1)",
    },
    ".current-agent .current-agent-name": {
      display: "inline-block",
      color: "#29314B",
    },
    ".batch-delete-btn": {
      position: "absolute",
      right: "10px",
      bottom: "-45px",
      "z-index": "9",
    },
    ".onlineSearch": {
      width: "80px",
    },
    ".onlineSearch>div": {
      padding: "0px",
      width: "80px",
    },
    ".mobile-online-area": {
      display: "flex",
      "justify-content": "flex-start",
      "align-items": "center",
      gap: "10px",
    },
    ".mobile-online-area .onlineSearch>div label": {
      "border-radius": "999px",
      padding: "0px 2px",
    },
    ".mobile-online-area .onlineSearch .personalSearchFlag>span": {
      padding: "0px 4px",
    },
    ".mobile-online-area .onlineSearch>div label svg": {
      width: "15px",
      height: "15px",
      top: "0px",
    },
    ".mobile-online-area .onlineSearch>div label .default": {
      display: "none",
    },
    ".onlineSearch-content>span": {
      display: "flex",
      "align-items": "center",
    },
    ".onlineSearch-content>span .online-text": {
      "padding-left": "3px",
    },
    ".mobile-online-area .cxd-Checkbox--button--checked": {
      color: "var(--Checkbox-onHover-color)",
      "border-color": "var(--Checkbox-onHover-color)",
    },
    ".mobile-online-area .cxd-Checkbox": {
      color: "var(--checkbox-checkbox-default-text-color)",
      "border-color": "var(--Checkbox-color)",
    },
    ".mobile-online-area .cxd-Checkbox--button--checked.cxd-Checkbox--checkbox.cxd-Checkbox--button:active":
      {
        color: "var(--Checkbox-onHover-color)",
        "border-color": "var(--Checkbox-onHover-color)",
      },
    ".mobile-online-area .cxd-Checkbox--button--checked:active": {
      color: "var(--Checkbox-onHover-color)",
      "border-color": "var(--Checkbox-onHover-color)",
    },
    ".mobile-online-area .cxd-Checkbox--button.cxd-Checkbox--checkbox:hover:not(:disabled):not(.cxd-Checkbox--button--checked)":
      {
        color: "var(--checkbox-checkbox-default-text-color)",
        "border-color": "var(--Checkbox-color)",
      },
    ".aside-drawer-body .cxd-Collapse": {
      "background-color": "transparent !important",
      "padding-inline": "inherit !important",
      "padding-block": "inherit !important",
    },
    ".aside-drawer-body .cxd-Collapse.is-active .cxd-Collapse-contentWrapper": {
      "margin-top": "0 !important",
    },
    ".aside-drawer .cxd-Drawer-body": {
      "padding-inline": "1rem",
      "padding-bottom": "0",
      background: "linear-gradient( 217deg, #FFFFFF 0%, #D1DFFF 100%)",
    },
    ".aside-drawer .new-btn": {
      height: "2.25rem",
      "border-radius": "8px",
    },
    ".historyDrawer  .cxd-Drawer-header": {
      "background-color": "transparent",
      "border-bottom": "none",
      "text-align": "center",
      "font-size": "1.125rem",
    },
    ".agentScrollbar:before": {
      display: "none",
    },
    ".agentScrollbar": {
      padding: "0px",
    },
    ".agentScrollbar .agent-avatar img": {
      display: "block",
      width: "4.5rem",
      height: "4.5rem",
      "border-radius": "9999px",
      "object-fit": "cover",
      "object-position": "center",
    },
    ".agentScrollbar .cxd-Card-avtar": {
      "flex-shrink": "0",
    },
    ".agentScrollbar .cxd-Card-meta": {
      "flex-grow": "0",
      "flex-shrink": "1",
      width: "calc(100% - 72px)",
      ".card-title": {
        width: "100%",
        ".cxd-TplField": {
          width: "100%",
          "word-break": "break-all",
          "text-overflow": "ellipsis",
          display: "inline-block",
          "-webkit-box-orient": "vertical",
          "-webkit-line-clamp": "1",
          overflow: "hidden",
          "white-space": "nowrap",
        },
      },
    },
    ".agentScrollbar .webKitBoxClamp1": {
      width: "100%",
      "word-break": "break-all",
      "text-overflow": "ellipsis",
      display: "inline-block",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": "1",
      overflow: "hidden",
      "white-space": "nowrap",
    },
    ".agentScrollbar .MobileListPage .card-border": {
      background: "#F6FAFF",
      "border-radius": "12px",
    },
    ".agentScrollbar .cxd-Card-desc": {
      "font-size": "12px",
      color: "#B2B8C2",
      "margin-top": "5px",
    },
    ".tipsHideScrollbar:before": {
      display: "none",
    },
  },
  data: {
    canSubmit: true,
    submiting: false,
    inputText: "",
    inputType: 1,
    activeCon: "${activeId || ''}",
    conversationType: "${agent == 1 ? 'agent' : 'chat'}",
    currentMessage: "",
    statusText: "",
    digitalHuman: false,
    digitalHumanVideoSrc:
      "https://u359243-b6e5-c127ec62.bjb1.seetacloud.com:8443/live/livestream.flv",
    digitalHumanActionUrl:
      "https://u359243-b6e5-c127ec62.bjb1.seetacloud.com:8443/metahuman/human",
    videoLoading: false,
    useStream: true,
    showAgents: false,
    currentAgent: null,
    files: [],
    device: "mobile",
    iconUrl: "",
    agentName: "",
    agentId: "",
  },
  onEvent: {
    init: {
      actions: [
        {
          actionType: "addSession",
          componentId: "AIConversation",
          args: {
            agentId: "${agentId}",
          },
          expression: "${agentId}",
        },
      ],
    },
  },
  body: {
    type: "wrapper",
    size: "none",
    className: "ai-view",
    body: [
      {
        type: "service",
        id: "openUniversalAgentSession",
        api: {
          url: "/ai/agent/session/openUniversalAgentSession?agentId=${__page.URLPARAMS.agentId}",
          method: "post",
          sendOn: "${!activeId}",
        },
        onEvent: {
          fetchInited: {
            actions: [
              {
                actionType: "setValue",
                componentId: "ai-helper-page",
                args: {
                  value: {
                    activeCon: "${event.data.id}",
                    conversationType: "agent",
                    iconUrl: "${event.data.iconUrl}",
                    agentName: "${event.data.agentName}",
                    agentId: "${event.data.agentId}",
                  },
                },
                expression: "${event.data.responseStatus == 0}",
              },
            ],
          },
        },
      },
      eventHandler,
      {
        visibleOn: "${digitalHuman}",
        type: "wrapper",
        size: "none",
        className: "player-wrapper",
        body: {
          type: "dhplayer",
          id: "dhplayer",
          url: "http://171.217.93.130:8010/offer",
          iceServer: "",
          api: {
            url: "http://171.217.93.130:8010/human",
            method: "post",
          },
        },
      },
      {
        type: "wrapper",
        className: "ai-header",
        style: {
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
        },
        body: [
          {
            type: "tpl",
            tpl: "",
          },
          {
            type: "tpl",
            tpl: "${agentName}",
          },
          {
            type: "icon",
            icon: "fa-bars",
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: "drawer",
                    drawer: Drawer,
                  },
                ],
              },
            },
          },
        ],
      },
      ...chatContent,
    ],
  },
};

export default jsonData;
