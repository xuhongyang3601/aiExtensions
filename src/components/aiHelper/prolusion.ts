export default {
  hiddenOn: "${(messageList && messageList.length > 0) || !canSubmit}",
  type: "service",
  className: "welcome-message text-center",
  api: {
    url: "/ai/assistant/setting/getRecommendation",
    data: {
      agentId: "${agentId}",
    },
    trackExpression: "${agentId}",
  },
  data: {
    size: 5,
  },
  body: [
    {
      type: "flex",
      className: "",
      style: {
        "max-width": "var(--content-max-width)",
        "min-width": "var(--content-min-width)",
        width: "var(--content-width)",
        "text-align": "left",
      },
      justify: "space-between",
      items: [
        {
          type: "service",
          className: "ai-card-item",
          style: {
            padding: "12px",
            background: "#fff",
            "border-radius": "10px",
            flex: "1",
            color: "rgba(102, 102, 102, 1)",
            "font-size": "14px",
            "line-height": "30px",
          },
          body: [
            {
              type: "tabs",
              swipeable: true,
              className: "prolusion-tabs",
              contentClassName: "prolusion-tabs-content",
              linksClassName: "prolusion-tabs-links",
              activeKey: "tab1",
              tabs: [
                {
                  visibleOn: "${enableRecommendationProblem}",
                  title: "推荐咨询",
                  hash: "tab1",
                  tab: [
                    {
                      type: "service",
                      id: "recommond-advice-service",
                      data: {
                        page: 1,
                      },
                      body: [
                        {
                          type: "each",
                          source:
                            "${ARRAYFILTER(recommendationProblemList, (item, index) => (index >= (size * (page - 1)) && index < (size * page)))}",
                          className: "agent-list",
                          items: {
                            type: "container",
                            className: "recommond-advice simple-list",
                            bodyClassName: "flex",
                            style: {
                              "margin-bottom": "8px",
                              background: "#F7F9FD",
                              "border-radius": "8px",
                              "line-height": "40px",
                              padding: "0 12px",
                            },
                            body: [
                              {
                                type: "tpl",
                                style: {
                                  color:
                                    "${IFS(index + (page - 1) * size == 0, 'rgb(244,100,92)', index + (page - 1) * size == 1, 'rgb(237,123,63)', index + (page - 1) * size == 2, 'rgb(242,168,92)', 'rgb(180,180,180)')}",
                                  "margin-right": "10px",
                                },
                                tpl: "${index + 1 + (page - 1) * size}",
                              },
                              {
                                type: "tpl",
                                tpl: "${item}",
                                className:
                                  "w-0 flex-1 overflow-hidden white-space-nowrap",
                                style: {
                                  "text-overflow": "ellipsis",
                                  color: "#29314B",
                                },
                              },
                            ],
                            onEvent: {
                              click: {
                                actions: [
                                  {
                                    actionType: "stopHuman",
                                    args: {
                                      type: "echo",
                                    },
                                    componentId: "dhplayer",
                                    expression: "${digitalHuman}",
                                  },
                                  {
                                    actionType: "streamChatSubmit",
                                    componentId: "AIConversation",
                                    args: {
                                      inputText: "${item}",
                                    },
                                    // expression: "${!digitalHuman && useStream}",
                                  },
                                  // {
                                  //   actionType: "chatSubmit",
                                  //   componentId: "AIConversation",
                                  //   args: {
                                  //     inputText: "${item}",
                                  //   },
                                  //   expression: "${digitalHuman || !useStream}",
                                  // },
                                ],
                              },
                            },
                          },
                        },
                        {
                          visibleOn:
                            "${COUNT(recommendationProblemList) > size}",
                          type: "action",
                          style: {
                            color: "#9498B5",
                            display: "block",
                            "text-align": "center",
                          },
                          body: [
                            {
                              type: "tpl",
                              tpl: "换一换",
                            },
                            {
                              type: "html",
                              style: {
                                "margin-left": "5px",
                                position: "relative",
                                top: "1px",
                              },
                              html:
                                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">\n                              <path id="Vector" d="M9.82726 4.38341C9.50931 3.63081 8.97657 2.98862 8.29564 2.53713C7.61472 2.08564 6.81581 1.84488 5.9988 1.84495C4.89713 1.84495 3.84058 2.28259 3.06159 3.06159C2.28259 3.84058 1.84495 4.89713 1.84495 5.9988C1.84495 7.10047 2.28259 8.15701 3.06159 8.93601C3.84058 9.71501 4.89713 10.1526 5.9988 10.1526C6.83427 10.1527 7.65036 9.90092 8.34057 9.43014C9.03077 8.95935 9.56303 8.29144 9.86788 7.51357C9.88984 7.45692 9.92277 7.40517 9.96478 7.36128C10.0068 7.31739 10.0571 7.28223 10.1127 7.25781C10.1683 7.23339 10.2282 7.22019 10.289 7.21898C10.3497 7.21776 10.4101 7.22855 10.4667 7.25073C10.5232 7.2729 10.5749 7.30603 10.6186 7.3482C10.6623 7.39038 10.6973 7.44077 10.7215 7.49649C10.7457 7.55222 10.7587 7.61217 10.7597 7.67292C10.7607 7.73366 10.7496 7.79401 10.7273 7.85049C10.3547 8.80116 9.70426 9.61745 8.86075 10.1928C8.01723 10.7682 7.01985 11.0758 5.9988 11.0757C3.19495 11.0757 0.921875 8.80264 0.921875 5.9988C0.921875 3.19495 3.19495 0.921875 5.9988 0.921875C7.69126 0.921875 9.22311 1.75726 10.1526 3.07772V2.07572C10.1526 1.95331 10.2013 1.83592 10.2878 1.74936C10.3744 1.66281 10.4918 1.61418 10.6142 1.61418C10.7366 1.61418 10.854 1.66281 10.9405 1.74936C11.0271 1.83592 11.0757 1.95331 11.0757 2.07572V4.84495C11.0759 4.90561 11.0641 4.96571 11.041 5.02179C11.0178 5.07787 10.9838 5.12882 10.9409 5.17172C10.8981 5.21461 10.8471 5.2486 10.791 5.27173C10.7349 5.29486 10.6748 5.30667 10.6142 5.30649H8.30649C8.18408 5.30649 8.06669 5.25786 7.98013 5.17131C7.89358 5.08475 7.84495 4.96736 7.84495 4.84495C7.84495 4.72254 7.89358 4.60515 7.98013 4.51859C8.06669 4.43204 8.18408 4.38341 8.30649 4.38341H9.82726Z" fill="currentColor"/>\n                              </svg>',
                            },
                          ],
                          onEvent: {
                            click: {
                              actions: [
                                {
                                  actionType: "setValue",
                                  componentId: "recommond-advice-service",
                                  args: {
                                    value: {
                                      page: "${page == 1 ? 2 : 1}",
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  visibleOn: "${recommendationAgentList}",
                  title: "推荐智能体",
                  hash: "tab2",
                  tab: [
                    {
                      type: "service",
                      id: "agent-service",
                      data: {
                        page: 1,
                      },
                      body: [
                        {
                          type: "each",
                          source:
                            "${ARRAYFILTER(recommendationAgentList, (item, index) => (index >= (size * (page - 1)) && index < (size * page)  && item.id !== agentId))}",
                          className: "agent-list",
                          items: {
                            type: "container",
                            className: "recommond-advice simple-list",
                            bodyClassName: "flex",
                            style: {
                              "margin-bottom": "8px",
                              background: "#F7F9FD",
                              "border-radius": "8px",
                              "line-height": "40px",
                              padding: "0 12px",
                            },
                            body: [
                              {
                                type: "tpl",
                                style: {
                                  color:
                                    "${IFS(index + (page - 1) * size == 0, 'rgb(244,100,92)', index + (page - 1) * size == 1, 'rgb(237,123,63)', index + (page - 1) * size == 2, 'rgb(242,168,92)', 'rgb(180,180,180)')}",
                                  "margin-right": "10px",
                                },
                                tpl: "${index + 1 + (page - 1) * size}",
                              },
                              {
                                type: "tpl",
                                tpl: "${item.name}",
                                className:
                                  "w-0 flex-1 overflow-hidden white-space-nowrap",
                                style: {
                                  "text-overflow": "ellipsis",
                                  color: "#29314B",
                                },
                              },
                            ],
                            onEvent: {
                              click: {
                                actions: [
                                  {
                                    actionType: "addSession",
                                    componentId: "AIConversation",
                                    args: {
                                      agentId: "${event.data.id}",
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        },
                        {
                          visibleOn: "${COUNT(recommendationAgentList) > size}",
                          type: "action",
                          style: {
                            color: "#9498B5",
                            display: "block",
                            "text-align": "center",
                          },
                          body: [
                            {
                              type: "tpl",
                              tpl: "换一换",
                            },
                            {
                              type: "html",
                              style: {
                                "margin-left": "5px",
                                position: "relative",
                                top: "1px",
                              },
                              html:
                                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">\n                              <path id="Vector" d="M9.82726 4.38341C9.50931 3.63081 8.97657 2.98862 8.29564 2.53713C7.61472 2.08564 6.81581 1.84488 5.9988 1.84495C4.89713 1.84495 3.84058 2.28259 3.06159 3.06159C2.28259 3.84058 1.84495 4.89713 1.84495 5.9988C1.84495 7.10047 2.28259 8.15701 3.06159 8.93601C3.84058 9.71501 4.89713 10.1526 5.9988 10.1526C6.83427 10.1527 7.65036 9.90092 8.34057 9.43014C9.03077 8.95935 9.56303 8.29144 9.86788 7.51357C9.88984 7.45692 9.92277 7.40517 9.96478 7.36128C10.0068 7.31739 10.0571 7.28223 10.1127 7.25781C10.1683 7.23339 10.2282 7.22019 10.289 7.21898C10.3497 7.21776 10.4101 7.22855 10.4667 7.25073C10.5232 7.2729 10.5749 7.30603 10.6186 7.3482C10.6623 7.39038 10.6973 7.44077 10.7215 7.49649C10.7457 7.55222 10.7587 7.61217 10.7597 7.67292C10.7607 7.73366 10.7496 7.79401 10.7273 7.85049C10.3547 8.80116 9.70426 9.61745 8.86075 10.1928C8.01723 10.7682 7.01985 11.0758 5.9988 11.0757C3.19495 11.0757 0.921875 8.80264 0.921875 5.9988C0.921875 3.19495 3.19495 0.921875 5.9988 0.921875C7.69126 0.921875 9.22311 1.75726 10.1526 3.07772V2.07572C10.1526 1.95331 10.2013 1.83592 10.2878 1.74936C10.3744 1.66281 10.4918 1.61418 10.6142 1.61418C10.7366 1.61418 10.854 1.66281 10.9405 1.74936C11.0271 1.83592 11.0757 1.95331 11.0757 2.07572V4.84495C11.0759 4.90561 11.0641 4.96571 11.041 5.02179C11.0178 5.07787 10.9838 5.12882 10.9409 5.17172C10.8981 5.21461 10.8471 5.2486 10.791 5.27173C10.7349 5.29486 10.6748 5.30667 10.6142 5.30649H8.30649C8.18408 5.30649 8.06669 5.25786 7.98013 5.17131C7.89358 5.08475 7.84495 4.96736 7.84495 4.84495C7.84495 4.72254 7.89358 4.60515 7.98013 4.51859C8.06669 4.43204 8.18408 4.38341 8.30649 4.38341H9.82726Z" fill="currentColor"/>\n                              </svg>',
                            },
                          ],
                          onEvent: {
                            click: {
                              actions: [
                                {
                                  actionType: "setValue",
                                  componentId: "agent-service",
                                  args: {
                                    value: {
                                      page: "${page == 1 ? 2 : 1}",
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  visibleOn: "${recommendationAppList}",
                  title: "推荐应用",
                  hash: "tab3",
                  tab: [
                    {
                      type: "service",
                      id: "recommond-app-service",
                      data: {
                        page: 1,
                      },
                      body: [
                        {
                          type: "each",
                          source:
                            "${ARRAYFILTER(recommendationAppList, (item, index) => (index >= (size * (page - 1)) && index < (size * page)))}",
                          className: "agent-list",
                          items: {
                            type: "container",
                            className: "recommond-advice simple-list",
                            bodyClassName: "flex",
                            style: {
                              "margin-bottom": "8px",
                              background: "#F7F9FD",
                              "border-radius": "8px",
                              "line-height": "40px",
                              padding: "0 12px",
                            },
                            body: [
                              {
                                type: "tpl",
                                style: {
                                  color:
                                    "${IFS(index + (page - 1) * size == 0, 'rgb(244,100,92)', index + (page - 1) * size == 1, 'rgb(237,123,63)', index + (page - 1) * size == 2, 'rgb(242,168,92)', 'rgb(180,180,180)')}",
                                  "margin-right": "10px",
                                },
                                tpl: "${index + 1 + (page - 1) * size}",
                              },
                              {
                                type: "tpl",
                                tpl: "${item.name}",
                                className:
                                  "w-0 flex-1 overflow-hidden white-space-nowrap",
                                style: {
                                  "text-overflow": "ellipsis",
                                  color: "#29314B",
                                },
                              },
                            ],
                            onEvent: {
                              click: {
                                actions: [
                                  {
                                    actionType: "custom",
                                    script:
                                      "const isMobile = window.matchMedia('(max-width: 768px)').matches;const obj={ 'actionType': 'url', 'args': { 'url': isMobile?event.data.mobileUrl:event.data.pcUrl, 'blank': true } };doAction(obj)",
                                  },
                                ],
                              },
                            },
                          },
                        },
                        {
                          visibleOn: "${COUNT(recommendationAppList) > size}",
                          type: "action",
                          style: {
                            color: "#9498B5",
                            display: "block",
                            "text-align": "center",
                          },
                          body: [
                            {
                              type: "tpl",
                              tpl: "换一换",
                            },
                            {
                              type: "html",
                              style: {
                                "margin-left": "5px",
                                position: "relative",
                                top: "1px",
                              },
                              html:
                                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">\n                              <path id="Vector" d="M9.82726 4.38341C9.50931 3.63081 8.97657 2.98862 8.29564 2.53713C7.61472 2.08564 6.81581 1.84488 5.9988 1.84495C4.89713 1.84495 3.84058 2.28259 3.06159 3.06159C2.28259 3.84058 1.84495 4.89713 1.84495 5.9988C1.84495 7.10047 2.28259 8.15701 3.06159 8.93601C3.84058 9.71501 4.89713 10.1526 5.9988 10.1526C6.83427 10.1527 7.65036 9.90092 8.34057 9.43014C9.03077 8.95935 9.56303 8.29144 9.86788 7.51357C9.88984 7.45692 9.92277 7.40517 9.96478 7.36128C10.0068 7.31739 10.0571 7.28223 10.1127 7.25781C10.1683 7.23339 10.2282 7.22019 10.289 7.21898C10.3497 7.21776 10.4101 7.22855 10.4667 7.25073C10.5232 7.2729 10.5749 7.30603 10.6186 7.3482C10.6623 7.39038 10.6973 7.44077 10.7215 7.49649C10.7457 7.55222 10.7587 7.61217 10.7597 7.67292C10.7607 7.73366 10.7496 7.79401 10.7273 7.85049C10.3547 8.80116 9.70426 9.61745 8.86075 10.1928C8.01723 10.7682 7.01985 11.0758 5.9988 11.0757C3.19495 11.0757 0.921875 8.80264 0.921875 5.9988C0.921875 3.19495 3.19495 0.921875 5.9988 0.921875C7.69126 0.921875 9.22311 1.75726 10.1526 3.07772V2.07572C10.1526 1.95331 10.2013 1.83592 10.2878 1.74936C10.3744 1.66281 10.4918 1.61418 10.6142 1.61418C10.7366 1.61418 10.854 1.66281 10.9405 1.74936C11.0271 1.83592 11.0757 1.95331 11.0757 2.07572V4.84495C11.0759 4.90561 11.0641 4.96571 11.041 5.02179C11.0178 5.07787 10.9838 5.12882 10.9409 5.17172C10.8981 5.21461 10.8471 5.2486 10.791 5.27173C10.7349 5.29486 10.6748 5.30667 10.6142 5.30649H8.30649C8.18408 5.30649 8.06669 5.25786 7.98013 5.17131C7.89358 5.08475 7.84495 4.96736 7.84495 4.84495C7.84495 4.72254 7.89358 4.60515 7.98013 4.51859C8.06669 4.43204 8.18408 4.38341 8.30649 4.38341H9.82726Z" fill="currentColor"/>\n                              </svg>',
                            },
                          ],
                          onEvent: {
                            click: {
                              actions: [
                                {
                                  actionType: "setValue",
                                  componentId: "recommond-app-service",
                                  args: {
                                    value: {
                                      page: "${page == 1 ? 2 : 1}",
                                    },
                                  },
                                },
                              ],
                            },
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
