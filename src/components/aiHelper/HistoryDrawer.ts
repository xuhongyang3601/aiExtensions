const HistoryDrawer = {
  title: "历史对话",
  showCloseButton: true,
  bodyClassName: "historyHideScrollbar",
  closeOnOutside: true,
  id: "historyDrawer",
  className: "historyDrawer",
  actions: [],
  body: [
    {
      type: "service",
      bodyClassName: "p-0",
      className: "p-0",
      id: "history-list-wrapper",
      data: {
        page: 1,
        size: 100,
        searchName: "",
      },
      api: {
        url:
          "/ai/qa/conversation/universalChat/sessionList?page=${page}&searchName=${searchName}",
        data: {
          perPage: "${size}",
          agentId: "${agentId}",
        },
      },
      body: [
        {
          type: "form",
          id: "history-search",
          className: "w-full",
          wrapWithPanel: false,
          submitText: "",
          body: [
            {
              type:"hidden",
              name:"ids",
              id:"ids"
            },
            {
              type: "flex",
              justify: "space-between",
              alignItems: "center",
              items: [
                {
                  type: "flex",
                  justify: "flex-start",
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
                      name: "keyword",
                      label: "",
                      className: "query-input-text",
                      placeholder: "搜索",
                      onEvent: {
                        change: {
                          actions: [
                            {
                              actionType: "setValue",
                              componentId: "history-list-wrapper",
                              args: {
                                value: {
                                  searchName: "${event.data.value}",
                                },
                              },
                            },
                          ],
                        },
                      },
                      id: "u:e23b02463d5d",
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
                    "margin-right": "9px",
                    padding: "2px 16px",
                    background: "var(--colors-neutral-fill-10)",
                    "border-radius": "50px",
                    flex: "1",
                  },
                },
              ],
              style: {
                padding: "0px 15px 11px 15px",
              },
            },
            {
              type: "wrapper",
              className: "p-0 w-full",
              style: {
                display: "flex",
                "justify-content": "flex-end",
              },
              body: [
                {
                  type: "button",
                  label: "批量删除",
                  level: "link",
                  disabledOn: "${!ids || !COUNT(ids)}",
                  className: "text-danger ml-2",
                  confirmText: "确定删除?",
                  onEvent:{
                    click:{
                      actions:[
                        {
                          actionType:"ajax",
                          api:{
                            url:"/ai/qa/conversation/universalChat/deleteBatch?ids=${JOIN(ids,',')}",
                            method:"post"
                          }
                        },
                        {
                          "actionType":"stopPropagation",
                          "expression" :"${event.data.responseData.result!=='success'}"
                        },
                        {
                          actionType:'toast',
                          "args": {
                            "msgType": "success",
                            "msg": "批量删除成功"
                          }
                        },
                        {
                          actionType: "setValue",
                          componentId: "list-service",
                          args: {
                            value: {
                              messageList: [],
                              detailedQuestionVisible: false,
                            },
                          },
                        },
                        {
                          actionType: "setValue",
                          componentId: "ids",
                          args: {
                            value:  [],
                          },
                        },
                        
                        {
                          actionType: "reload",
                          componentId: "history-list-wrapper",
                        },
                        {
                          actionType:"hidden",
                          componentId:"history-list"
                        },
                        {
                          "actionType": "wait",
                          "args": {
                            "time": 10
                          }
                        },
                        {
                          actionType:"show",
                          componentId:"history-list"
                        },
                      ]
                    }
                  }
                },
              ],
            },
          ],
        },
        {
          type: "each",
          className: "conversation-list",
          name: "records",
          id: "history-list",
          items: {
            type: "wrapper",
            size: "none",
            className: {
              "list-wrapper-items": true,
              active: "${activeCon == item.sessionId}",
            },
            body: [
              {
                name: "id",
                type: "checkbox",
                className:"ids-checkbox",
                label: false,
                strictMode: false,
                value:"${ARRAYSOME(GETRENDERERDATA('history-search','ids'),item => item===sessionId)}",
                onEvent:{
                  change:{
                    actions:[
                      {
                        actionType:'setValue',
                        componentId:"ids",
                        expression:"${event.data.value}",
                        args:{
                          value:"${CONCAT(GETRENDERERDATA('history-search','ids'),[event.data.sessionId])}"
                        }
                      },
                      {
                        actionType:'setValue',
                        componentId:"ids",
                        expression:"${!event.data.value}",
                        args:{
                          value:"${ARRAYFILTER(GETRENDERERDATA('history-search','ids'),item => item!==event.data.sessionId)}"
                        }
                      }
                    ]
                  }
                }
              },
              {
                type: "tpl",
                className: "list-name",
                tpl: "${item.sessionName}",
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
                        stopPropagation: "${activeCon === item.sessionId}",
                      },
                      {
                        actionType: "setValue",
                        componentId: "inputText",
                        args: {
                          value: "",
                        },
                      },
                      {
                        actionType: "setValue",
                        componentId: "ai-helper-page",
                        args: {
                          value: {
                            conversationType: "chat",
                          },
                        },
                      },
                      {
                        actionType: "setValue",
                        componentId: "ai-helper-page",
                        args: {
                          value: {
                            activeCon: "${item.sessionId}",
                            canSubmit: true,
                          },
                        },
                      },
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
              {
                type: "wrapper",
                size: "none",
                body: [
                  {
                    label: "",
                    type: "button",
                    level: "link",
                    icon: "fa fa-trash-o",
                    actionType: "dialog",
                    dialog: {
                      title: "",
                      body: "确认删除这段对话吗？",
                      onEvent: {
                        confirm: {
                          actions: [
                            {
                              actionType: "ajax",
                              api: {
                                url:
                                  "/ai/qa/conversation/universalChat/delete/${item.sessionId}",
                                method: "post",
                                data: {
                                  id: "${item.sessionId}",
                                },
                                messages: {
                                  success: "删除成功",
                                },
                              },
                            },
                            {
                              actionType: "setValue",
                              componentId: "list-service",
                              args: {
                                value: {
                                  messageList: [],
                                  detailedQuestionVisible: false,
                                },
                              },
                            },
                            {
                              actionType: "setValue",
                              componentId: "ids",
                              args: {
                                value:
                                  "${ARRAYFILTER(GETRENDERERDATA('history-search','ids'),item => item!==event.data.sessionId)}",
                              },
                            },
                            {
                              actionType: "reload",
                              componentId: "history-list-wrapper",
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export default HistoryDrawer;
