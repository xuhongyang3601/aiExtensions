const TipsDrawer = {
  title: "提示词指令",
  showCloseButton: true,
  className: "tipsDrawer",
  bodyClassName: "hideScrollbar",
  closeOnOutside: true,
  id: "tipsDrawer",
  actions: [],
  body: [
    {
      type: "service",
      id: "tips-service",
      api: {
        url: "/ai/cueWord/directory/list",
        method: "get",
        data: {},
        requestAdaptor: "",
        adaptor: "",
        messages: {},
        responseData: {
          directoryList:
            "${CONCAT([{directoryName: '全部', customNode: true, id: null, cueWordName: null, page: 1, perPage: 9999999 }],items)}",
        },
      },
      data: {
        keywords: "",
      },
      body: [
        {
          type: "search-box",
          name: "keywords",
          clearable: true,
          style: {
            width: "100%",
            marginBottom: 20,
            height: "40px",
            borderRadius: "20px",
          },
          onEvent: {
            search: {
              actions: [
                {
                  actionType: "setValue",
                  componentId: "tips-service",
                  args: {
                    value: {
                      keywords: "${keywords}",
                    },
                  },
                },
              ],
            },
            change: {
              actions: [
                {
                  actionType: "setValue",
                  componentId: "tips-service",
                  args: {
                    value: {
                      keywords: "${keywords}",
                    },
                  },
                },
              ],
            },
          },
        },
        {
          type: "tabs",
          className: "tips-drawer-tabs",
          source: "${directoryList}",
          visibleOn: "${!keywords}",
          tabsMode: "line",
          swipeable: true,
          tabs: [
            {
              className: "p-0",
              title: "${directoryName}",
              body: [
                {
                  type: "service",
                  api: {
                    method: "get",
                    url: "/ai/cueWord/detail/page?directoryId=${id}",
                    messages: {},
                    requestAdaptor: "",
                    adaptor: "",
                    data: {
                      "&": "$$",
                    },
                  },
                  body: [
                    {
                      type: "each",
                      source: "${records}",
                      className: "flex flex-wrap",
                      items: {
                        type: "container",
                        className: "tipsDrawer-item bg-white rounded-xl",
                        style: {
                          backgroundColor: "#EEF4FE",
                          padding: "15px 10px",
                          borderRadius: "10px",
                          width: "100%",
                          height: "auto",
                          marginTop: "10px",
                          cursor: "pointer",
                        },
                        onEvent: {
                          click: {
                            actions: [
                              {
                                actionType: "setValue",
                                componentId: "inputText",
                                args: {
                                  value:
                                    "${JOIN(ARRAYFILTER([baseInfoDTO.taskTarget,baseInfoDTO.backgroundInfo,baseInfoDTO.outputRequirements], item=>!!item), ',')}",
                                },
                              },
                              {
                                actionType: "focus",
                                componentId: "inputText",
                              },
                              {
                                actionType: "cancel",
                                componentId: "tipsDrawer",
                              },
                              {
                                actionType: "cancel",
                                componentId: "aside-drawer",
                              },
                            ],
                          },
                        },
                        body: [
                          {
                            type: "container",
                            body: "${baseInfoDTO.cueWordName}",
                            style: {
                              color: "#333",
                              "word-break": "break-all",
                              fontWeight: "600",
                              marginBottom: "15px",
                            },
                          },
                          {
                            type: "wrapper",
                            body: [
                              {
                                type: "tpl",
                                tpl: "${baseInfoDTO.taskTarget}",
                              },
                              {
                                type: "tpl",
                                tpl: " ,${baseInfoDTO.backgroundInfo}",
                                visibleOn: "${baseInfoDTO.backgroundInfo}",
                              },

                              {
                                type: "tpl",
                                tpl: " ,${baseInfoDTO.outputRequirements}",
                                visibleOn: "${baseInfoDTO.outputRequirements}",
                              },
                            ],
                            size: "none",
                            style: {
                              color: "#999999",
                              "font-size": "12px",
                              display: "-webkit-box",
                              "-webkit-box-orient": "vertical",
                              "-webkit-line-clamp": "5",
                              overflow: "hidden",
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
        {
          type: "service",
          visibleOn: "${keywords}",
          api: {
            method: "get",
            url: "/ai/cueWord/detail/page",
            messages: {},
            requestAdaptor: "",
            adaptor: "",
            data: {
              page: 1,
              perPage: 9999999,
              cueWordName: "${keywords}",
            },
          },
          body: [
            {
              type: "each",
              source: "${records}",
              className: "flex flex-wrap",
              items: {
                type: "container",
                className: "tipsDrawer-item bg-white rounded-xl",
                style: {
                  backgroundColor: "#EEF4FE",
                  padding: "15px 10px",
                  borderRadius: "10px",
                  width: "100%",
                  height: "auto",
                  marginTop: "10px",
                  cursor: "pointer",
                },
                onEvent: {
                  click: {
                    actions: [
                      {
                        actionType: "setValue",
                        componentId: "inputText",
                        args: {
                          value:
                            "${JOIN(ARRAYFILTER([baseInfoDTO.taskTarget,baseInfoDTO.backgroundInfo,baseInfoDTO.outputRequirements], item=>!!item), ',')}",
                        },
                      },
                      {
                        actionType: "focus",
                        componentId: "inputText",
                      },
                      {
                        actionType: "cancel",
                        componentId: "tipsDrawer",
                      },
                      {
                        actionType: "cancel",
                        componentId: "aside-drawer",
                      },
                    ],
                  },
                },
                body: [
                  {
                    type: "container",
                    body: "${baseInfoDTO.cueWordName}",
                    style: {
                      color: "#333",
                      "word-break": "break-all",
                      fontWeight: "600",
                      marginBottom: "15px",
                    },
                  },
                  {
                    type: "wrapper",
                    body: [
                      {
                        type: "tpl",
                        tpl: "${baseInfoDTO.taskTarget}",
                      },
                      {
                        type: "tpl",
                        tpl: " ,${baseInfoDTO.backgroundInfo}",
                        visibleOn: "${baseInfoDTO.backgroundInfo}",
                      },

                      {
                        type: "tpl",
                        tpl: " ,${baseInfoDTO.outputRequirements}",
                        visibleOn: "${baseInfoDTO.outputRequirements}",
                      },
                    ],
                    size: "none",
                    style: {
                      color: "#999999",
                      "font-size": "12px",
                      display: "-webkit-box",
                      "-webkit-box-orient": "vertical",
                      "-webkit-line-clamp": "5",
                      overflow: "hidden",
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
};

export default TipsDrawer;
