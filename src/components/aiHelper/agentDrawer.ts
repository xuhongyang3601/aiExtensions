const AgentDrawer = {
  title: false,
  showCloseButton: false,
  bodyClassName: "agentScrollbar",
  closeOnOutside: true,
  id: "agentDrawer",
  className: "agentDrawer",
  size: "lg",
  actions: [],
  cssVars: {
    "--drawer-content-paddingTop": "0px",
  },
  body: [
    {
      type: "page",
      id: "agentPage",
      initApi: {
        method: "get",
        url:
          "/ai/api/common/options?className=com.maiyue.dianda.aiAssistant.agent.manage.domain.AgentCaseType",
        responseData: {
          options: "${items}",
        },
      },
      data: {
        name: "",
      },
      headerClassName: "pt-0 pb-0 mobile-page-header",
      title: {
        type: "flex",
        justify: "space-between",
        alignItems: "center",
        items: [
          {
            type: "icon",
            icon: "fas fa-angle-left",
            style: {
              "font-size": "18px",
            },
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: "closeDrawer",
                  },
                ],
              },
            },
          },
          {
            type: "tpl",
            tpl: "智能体广场",
            className: "mobile-page-title",
          },
          {
            type: "tpl",
            tpl: "",
          },
        ],
      },
      body: [
        {
          type: "form",
          title: "",
          debug: false,
          mode: "inline",
          wrapWithPanel: false,
          className: "w-full bg-white query-form",
          body: [
            {
              type: "flex",
              justify: "center",
              alignItems: "center",
              items: [
                {
                  type: "icon",
                  icon: "fas fa-search",
                  style: {
                    "margin-right": "9px",
                    color: "var(--colors-neutral-text-6)",
                    "font-size": "14px",
                  },
                },
                {
                  type: "input-text",
                  name: "name",
                  label: "",
                  className: "query-input-text",
                  placeholder: "搜索智能体",
                  onEvent: {
                    clear: {
                      actions: [
                        {
                          actionType: "reload",
                          componentName: "agentPage",
                          data: {
                            name: "",
                          },
                        },
                      ],
                    },
                    change: {
                      actions: [
                        {
                          actionType: "reload",
                          componentName: "agentPage",
                          data: {
                            name: "${event.data.value}",
                          },
                        },
                      ],
                    },
                  },
                  id: "u:e23b01263d5d",
                  wrapperCustomStyle: {
                    root: {
                      flex: "1",
                      padding: "0 0 9px 0",
                      height: "33px",
                    },
                    ".cxd-TextControl.is-focused>.cxd-TextControl-input, .cxd-TextControl-input, .cxd-TextControl-input.active, .cxd-TextControl-input:hover": {
                      background: "transparent",
                    },
                  },
                },
              ],
              style: {
                margin: "0px 10px",
                padding: "2px 16px",
                background: "var(--colors-neutral-fill-10)",
                "border-radius": "50px",
              },
            },
          ],
          actions: [],
        },
        {
          type: "tabs",
          source: '${CONCAT([{"value":"","label":"全部"}],options)}',
          mountOnEnter: true,
          unmountOnExit: true,
          className: "h-full mobile_page_tabs",
          defaultKey: 0,
          tabs: [
            {
              title: "${label}",
              body: [
                {
                  type: "mobile-list-page",
                  id: "message_center_list_page",
                  api: {
                    method: "post",
                    url: "/ai/api/agent/querySquarePage",
                    data: {
                      agentType: "${value}",
                      name: "${name || ''}",
                    },
                    trackExpression: "${name}",
                  },
                  style: {
                    "padding-top": "12px",
                    "padding-bottom": "12px",
                    height: "calc(100% - 70px)",
                    "overflow-y": "auto",
                    background: "white",
                  },
                  list: {
                    type: "service",
                    className: "p-0",
                    data: {},
                    style: {
                      margin: "0px 15px",
                    },
                    body: {
                      type: "card",
                      className: "card-border",
                      header: {
                        title: "${baseInfoDTO.name}",
                        subTitle: "${baseInfoDTO.description}",
                        titleClassName: "text-lg card-title webKitBoxClamp1",
                        avatarClassName: "agent-avatar",
                        description: "${creatorName}",
                        avatar:
                          "${baseInfoDTO.icon.url ? CONTEXT_ROOT + baseInfoDTO.icon.url : '/dianda/ai/icons/agent-avg.png'}",
                      },
                    },
                  },
                  onEvent: {
                    clickItem: {
                      actions: [
                        {
                          actionType: "cancel",
                          componentId: "agentDrawer",
                        },
                        {
                          actionType: "cancel",
                          componentId: "aside-drawer",
                        },
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
                          stopPropagation: "${activeCon === item.id}",
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
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      pullRefresh: {
        disabled: true,
      },
      bodyClassName: "p-0 overflow-y-hidden",
    },
  ],
};

export default AgentDrawer;
