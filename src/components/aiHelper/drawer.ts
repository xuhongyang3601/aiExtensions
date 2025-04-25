import FeedBackDrawer from "./feedBackDrawer";
import TipsDrawer from "./TipsDrawer";
import HistoryDrawer from "./HistoryDrawer";
import { userInfoCss, cardWrapperCss, historyAgentCss } from "./css";
import agent from "@/static/image/ai/agent.png";
import feedbackPng from "@/static/image/ai/feedback.png";
import historyPng from "@/static/image/ai/history.png";
import tscPng from "@/static/image/ai/tsc.png";
import AgentDrawer from './agentDrawer'

export default {
  title: "",
  showCloseButton: false,
  className: "aside-drawer",
  id: "aside-drawer",
  bodyClassName: "aside-drawer-body hideScrollbar",
  closeOnOutside: true,
  width: "80%",
  actions: [],
  body: [
    {
      type: "wrapper",
      className: "p-0",
      body: [
        {
          type: "service",
          api: "/uis/myInfo/get",
          body: [
            {
              type: "wrapper",
              className: "button-wrapper mb-1",
              size: "none",
              visibleOn: "${guest}",
              body: {
                className: "new-btn",
                label: "登录",
                type: "button",
                block: true,
                disabledOn: "${submiting}",
                onEvent: {
                  click: {
                    actions: [
                      {
                        actionType: "cancel",
                        componentId: "aside-drawer",
                      },
                      {
                        actionType: "link",
                        args: {
                          link: "/login",
                          redirect: true,
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              type: "container",
              hiddenOn: "${guest}",
              id: "userInfoWrapper",
              wrapperCustomStyle: userInfoCss,
              bodyClassName: "userInfo-wrapper",
              body: [
                {
                  type: "container",
                  body: [
                    {
                      type: "image",
                      src: "${CONTEXT_ROOT + ls:userInfo.avatarUrl}",
                      thumbRatio: "1:1",
                      thumbMode: "cover",
                      innerClassName: "no-border",
                      imageClassName: "rounded-full",
                      width: "1.875rem",
                      height: "1.875rem",
                    },
                    {
                      type: "tpl",
                      className: "user-name",
                      tpl: "${name}",
                    },
                  ],
                },
                {
                  type: "button",
                  label: "",
                  icon: "fa fa-ellipsis-v",
                  actionType: "drawer",
                  style: {
                    border: "none",
                  },
                  className: "text-info text-xl",
                  drawer: {
                    title: "请选择门户类型",
                    className: "mobile-drawer-container",
                    headerClassName: "text-center",
                    position: "bottom",
                    height: "60%",
                    body: {
                      type: "container",
                      id: "u:2357de29f01",
                      body: [
                        {
                          name: "home",
                          type: "radios",
                          label: "",
                          icon: "icon maiyueiconfont icon-redio_un_selected",
                          iconActive:
                            "icon maiyueiconfont icon-radio_xuanzhong",
                          inputOnly: true,
                          inline: false,
                          value: "${ls:homePath}",
                          source: {
                            url:
                              "/platform/api/portal/myPortals?terminalType=mobile",
                            responseData: {
                              options: "${items}",
                            },
                          },
                        },
                      ],
                      wrapperCustomStyle: {
                        ".cxd-Checkbox": {
                          "padding-left": "0",
                          display: "flex",
                          "flex-direction": "row-reverse",
                          "justify-content": "space-between",
                          ">i": {
                            "font-size": "20px",
                          },
                          ">i+span": {
                            "margin-left": "0",
                            "font-size": "var(--fonts-size-6)",
                            color: "var(--colors-neutral-text-4)",
                          },
                        },
                      },
                    },
                    actions: [
                      {
                        type: "button",
                        label: "确定",
                        block: true,
                        actionType: "confirm",
                        primary: true,
                        style: {
                          height: "44px",
                        },
                        onEvent: {
                          click: {
                            actions: [
                              {
                                actionType: "custom",
                                script:
                                  "window.maiyueSoftGlobalData.reloadLayout && window.maiyueSoftGlobalData.reloadLayout(event.data.home)",
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          type: "wrapper",
          className: "button-wrapper",
          size: "none",
          body: {
            className: "new-btn",
            label: "新建对话",
            type: "button",
            block: true,
            icon: "fa fa-plus",
            disabledOn: "${submiting}",
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: "addSession",
                    componentId: "AIConversation",
                    args: {
                      agentId: "${agentId}",
                    },
                  },
                  {
                    actionType: "setValue",
                    componentId: "list-service",
                    args: {
                      value: {
                        messageList: [],
                      },
                    },
                  },
                  {
                    actionType: "setValue",
                    componentId: "list-service",
                    args: {
                      value: {
                        detailedQuestionVisible: false,
                      },
                    },
                  },
                  {
                    actionType: "cancel",
                    componentId: "aside-drawer",
                  },
                ],
              },
            },
          },
        },
        {
          visibleOn: "${enableDigitalHuman}",
          name: "switch",
          type: "switch",
          option: "开启数字人",
          value: "${digitalHuman}",
          onEvent: {
            change: {
              actions: [
                {
                  actionType: "setValue",
                  componentId: "ai-helper-page",
                  args: {
                    value: {
                      digitalHuman: "${event.data.value}",
                    },
                  },
                },
              ],
            },
          },
        },
        // 卡片------
        {
          type: "container",
          id: "card-wrapper",
          wrapperCustomStyle: cardWrapperCss,
          bodyClassName: "card-wrapper",
          body: [
            {
              type: "container",
              wrapperBody: false,
              className: "card-item",
              body: [
                {
                  type: "image",
                  src: tscPng,
                  thumbRatio: "1:1",
                  thumbMode: "cover",
                  innerClassName: "no-border",
                  imageClassName: "rounded-full",
                  width: "1.25rem",
                  height: "1.25rem",
                },
                {
                  type: "tpl",
                  className: "card-name",
                  tpl: "提示词",
                },
              ],
              onEvent: {
                click: {
                  actions: [
                    {
                      stopPropagation: "${submiting}",
                    },
                    {
                      actionType: "drawer",
                      drawer: TipsDrawer,
                      data: {
                        hideCueWord: true,
                        CONTEXT_ROOT: "${CONTEXT_ROOT}",
                      },
                    },
                    {
                      actionType: "changeActiveKey",
                      componentId: "bbxTabs",
                      args: {
                        activeKey: 2,
                      },
                    },
                  ],
                },
              },
            },
            {
              type: "container",
              wrapperBody: false,
              className: "card-item",
              body: [
                {
                  type: "image",
                  src: agent,
                  thumbRatio: "1:1",
                  thumbMode: "cover",
                  innerClassName: "no-border",
                  imageClassName: "rounded-full",
                  width: "1.25rem",
                  height: "1.25rem",
                },
                {
                  type: "tpl",
                  className: "card-name",
                  tpl: "智能体广场",
                },
              ],
              onEvent: {
                click: {
                  actions: [
                    {
                      stopPropagation: "${submiting}",
                    },
                    {
                      actionType: "drawer",
                      drawer: AgentDrawer,
                    },
                  ],
                },
              },
            },
            {
              type: "container",
              wrapperBody: false,
              className: "card-item",
              body: [
                {
                  type: "image",
                  src: historyPng,
                  thumbRatio: "1:1",
                  thumbMode: "cover",
                  innerClassName: "no-border",
                  imageClassName: "rounded-full",
                  width: "1.25rem",
                  height: "1.25rem",
                },
                {
                  type: "tpl",
                  className: "card-name",
                  tpl: "历史对话",
                },
              ],
              onEvent: {
                click: {
                  actions: [
                    {
                      stopPropagation: "${submiting}",
                    },
                    {
                      actionType: "drawer",
                      drawer: HistoryDrawer,
                    },
                  ],
                },
              },
            },
            {
              type: "container",
              wrapperBody: false,
              className: "card-item",
              body: [
                {
                  type: "image",
                  src: feedbackPng,
                  thumbRatio: "1:1",
                  thumbMode: "cover",
                  innerClassName: "no-border",
                  imageClassName: "rounded-full",
                  width: "1.25rem",
                  height: "1.25rem",
                },
                {
                  type: "tpl",
                  className: "card-name",
                  tpl: "意见反馈",
                },
              ],
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: "drawer",
                      drawer: FeedBackDrawer,
                    },
                  ],
                },
              },
            },
          ],
        },
        // 卡片---
        // 使用过的智能体---
        {
          type: "container",
          id: "history-agent",
          className: "history-agent",
          wrapperCustomStyle: historyAgentCss,
          body: [
            {
              type: "collapse-group",
              className: "collapse-group",
              expandIconPosition: "right",
              activeKey: ["1"],
              body: [
                {
                  type: "collapse",
                  key: "1",
                  header: "我使用过的智能体",
                  body: [
                    {
                      type: "service",
                      id: "session-wrapper",
                      api: {
                        url: "/ai/agent/session/sessionPage",
                        responseData: {
                          originalSessionList: "${records}",
                          sessionList: "${records}",
                        },
                      },
                      body: [
                        {
                          type: "each",
                          className: "history-agent-list",
                          name: "sessionList",
                          items: {
                            type: "wrapper",
                            className: {
                              "list-wrapper-items": true,
                              "my-Wrapper": true,
                              active:
                                "${GETRENDERERDATA('ai-helper-page','agentId') == item.id}",
                            },
                            body: [
                              {
                                visibleOn: "${!!item.iconUrl}",
                                type: "image",
                                src: "${CONTEXT_ROOT}${item.iconUrl}",
                                thumbMode: "cover",
                                thumbRatio: "1:1",
                                className: "flex justify-center items-center",
                                imageClassName: "rounded-full",
                                innerClassName: "no-border p-0 mb-0 mr-3",
                                width: "2.25rem",
                                height: "2.25rem",
                              },
                              {
                                hiddenOn: "${!!item.iconUrl}",
                                type: "icon",
                                icon: "fa-commenting-o",
                                className: "text-primary mr-2 icon-commenting",
                              },
                              {
                                type: "container",
                                body: [
                                  {
                                    type: "tpl",
                                    className: "list-name",
                                    tpl: "<div>${item.sessionName}</div>",
                                  },
                                  {
                                    type: "tpl",
                                    className: "list-desc",
                                    tpl: "<div>${item.description}</div>",
                                  },
                                ],
                                onEvent: {
                                  click: {
                                    actions: [
                                      {
                                        actionType: "toast",
                                        args: {
                                          msgType: "warning",
                                          msg: "请等待答案生成完毕",
                                        },
                                        expression: "${submiting}",
                                        stopPropagation: "${submiting}",
                                      },
                                      {
                                        stopPropagation:
                                          "${activeCon === item.id}",
                                      },
                                      {
                                        actionType: "setValue",
                                        componentId: "inputText",
                                        args: {
                                          value: "",
                                        },
                                      },
                                      {
                                        actionType: "addSession",
                                        componentId: "AIConversation",
                                        args: {
                                          agentId: "${event.data.id}",
                                        },
                                      },
                                      // {
                                      //   "actionType": "setValue",
                                      //   "componentId": "ai-helper-page",
                                      //   "args": {
                                      //     "value": {
                                      //       "conversationType": "agent"
                                      //     }
                                      //   }
                                      // },
                                      // {
                                      //   "actionType": "setValue",
                                      //   "componentId": "ai-helper-page",
                                      //   "args": {
                                      //     "value": {
                                      //       "activeCon": "${item.id}",
                                      //       "canSubmit": "${!!item.agentPublishStatus}"
                                      //     }
                                      //   }
                                      // },
                                      {
                                        actionType: "setValue",
                                        componentId: "list-service",
                                        args: {
                                          value: {
                                            detailedQuestionVisible: false,
                                            messageList: [],
                                            shouldScrollToBottom: true,
                                          },
                                        },
                                      },
                                      {
                                        actionType: "cancel",
                                        componentId: "aside-drawer",
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
