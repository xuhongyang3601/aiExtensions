import prolusion from "./prolusion";
import { inputCss } from "./css";
export default [
  {
    type: "service",
    showErrorMsg: false,
    className: "ai-body hideScrollbar",
    id: "list-service",
    name: "list-service",
    style: {
      "background-size": "cover",
      "background-repeat": "no-repeat",
    },
    api: {
      url: "/ai/agent/sessionItem/chatLog?sessionId=${activeCon}",
      sendOn: "${!!activeCon}",
      responseData: {
        messageList: "$items",
      },
      data: {},
    },
    data: {
      detailedQuestionVisible: false,
      currentQuestionId: "",
      robotLoading: false,
      temporaryDisableNetworking: false,
      shouldScrollToBottom: false,
    },
    onEvent: {
      fetchInited: {
        actions: [
          {
            actionType: "setValue",
            componentId: "list-service",
            args: {
              value: {
                messageList: [],
              },
            },
            expression: "${event.data.responseStatus != 0}",
          },
          {
            actionType: "custom",
            script:
              "setTimeout(() => {const messageWrapper = document.querySelector('.message-wrapper');messageWrapper.scrollTop = messageWrapper.scrollHeight;}, 500)",
            expression: "${shouldScrollToBottom}",
          },
          {
            actionType: "custom",
            script:
              "setTimeout(() => {const messageWrapper = document.querySelector('.message-wrapper');messageWrapper.scrollTop = messageWrapper.scrollHeight;}, 600)",
            expression: "${shouldScrollToBottom}",
          },
          {
            actionType: "setValue",
            componentId: "list-service",
            args: {
              value: {
                shouldScrollToBottom: false,
              },
            },
          },
        ],
      },
    },
    body: [
      {
        type: "service",
        api: "/platform/api/platfsett/global",
        className: "message-wrapper hideScrollbar",
        id: "message-wrapper",
        data: {
          streamData: "",
        },
        body: [
          prolusion,
          {
            type: "each",
            name: "messageList",
            placeholder: "",
            items: {
              type: "service",
              id: "${item.id}",
              className: "message_${item.id}",
              body: [
                {
                  type: "container",
                  body: [
                    {
                      type: "ai-message-agent",
                      body: "${item.messageAmis}",
                      isMobile: true,
                      portrait: "${iconUrl}",
                      robot: "${item.role !== 'user'}",
                      answerFeedbackType: "${item.answerFeedbackType}",
                      messageId: "${item.id}",
                      contactWay: "${item.contactWay}",
                      responsibleDepartment: "${item.responsibleDepartment}",
                      onEvent: {
                        feedbackClick: {
                          actions: [
                            {
                              actionType: "feedbackClick",
                              componentId: "AIConversation",
                              args: {
                                url: "${conversationType ==='chat' ? '/ai/qa/conversation/universalChat/feedback' : '/ai/agent/sessionItem/feedback'}",
                                id: "${item.id}",
                                feedbackType: "${event.data.feedbackType}",
                                index: "${event.data.index}",
                                messageList:
                                  "${GETRENDERERDATA('list-service','messageList')}",
                              },
                            },
                          ],
                        },
                        voiceClick: {
                          actions: [
                            {
                              actionType: "broadcast",
                              args: {
                                eventName: "broadcast_voiceClick",
                              },
                              data: {
                                id: "${item.id}",
                              },
                            },
                          ],
                        },
                        broadcast_voiceClick: {
                          actions: [
                            {
                              actionType: "checkVoiceId",
                              args: {
                                voiceId: "${event.data.id}",
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  onEvent: {
                    click: {
                      actions: [
                        {
                          actionType: "setValue",
                          componentId: "ai-helper-page",
                          args: {
                            value: {
                              currentMessage: "${item.id}",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            visibleOn: "${robotLoading}",
            type: "ai-message-agent",
            portrait: "${iconUrl}",
            body: {
              type: "wrapper",
              size: "none",
              className: "flex items-center",
              body: [
                {
                  visibleOn: "${!ISEMPTY(statusText)}",
                  type: "tpl",
                  tpl: "${statusText}",
                  style: {
                    "margin-right": "10px",
                  },
                },
                {
                  type: "spinner",
                  show: true,
                },
              ],
            },
            renderType: "schema",
            robot: true,
            isMobile: true,
            hideTools: true,
          },
          {
            visibleOn: "${streaming && streamData.messageAmis}",
            type: "ai-message-agent",
            portrait: "${iconUrl}",
            body: "${streamData.messageAmis}",
            robot: true,
            hideTools: true,
            isMobile: true,
            messageId: "streamMessageWrapper",
          },
        ],
      },
      {
        type: "ai-input-connection",
        visibleOn: "${!submiting && !showAgents}",
        className: {
          "input-connection-mobile": true,
        },
        id: "input-connection",
        onEvent: {
          select: {
            actions: [
              {
                actionType: "setValue",
                componentId: "inputText",
                args: {
                  value: "",
                },
              },
              // {
              //   actionType: 'chatSubmit',
              //   componentId: 'AIConversation',
              //   args: {
              //     inputText: '${event.data.value}',
              //   },
              //   expression: '${digitalHuman || !useStream}',
              // },
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
                  inputText: "${event.data.value}",
                },
                // expression: '${!digitalHuman && useStream}',
              },
            ],
          },
          download: {
            actions: [
              {
                actionType: "link",
                args: {
                  blank: true,
                  href: "${event.data.value}",
                  url: "${event.data.value}",
                },
              },
            ],
          },
        },
      },
      {
        visibleOn: "${!submiting && showAgents && conversationType === 'chat'}",
        type: "ai-agents",
        show: "${showAgents}",
        onEvent: {
          close: {
            actions: [
              {
                actionType: "setValue",
                componentId: "ai-helper-page",
                args: {
                  value: {
                    showAgents: false,
                  },
                },
              },
            ],
          },
          select: {
            actions: [
              {
                actionType: "setValue",
                componentId: "ai-helper-page",
                args: {
                  value: {
                    showAgents: false,
                    currentAgent: "${event.data.value}",
                  },
                },
              },
              {
                actionType: "setValue",
                componentId: "inputText",
                args: {
                  value:
                    "${LEFT(GETRENDERERDATA('input-form', 'inputText'), LEN(GETRENDERERDATA('input-form', 'inputText')) - 1)}",
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    type: "wrapper",
    className: {
      "ai-foot": true,
    },
    size: "none",
    style: {
      padding: "12px",
    },
    body: [
      {
        visibleOn: "${currentAgent}",
        type: "wrapper",
        size: "none",
        className: "current-agent",
        body: [
          {
            type: "container",
            className: "left-area",
            bodyClassName: "flex items-center",
            body: [
              {
                type: "image",
                src: "${CONTEXT_ROOT}${currentAgent.iconPath || '/ai/icons/ai_portrait.png'}",
                thumbRatio: "1:1",
                thumbMode: "cover",
                innerClassName: "no-border",
                imageClassName: "rounded-full",
                className: "mr-1.5 flex justify-center items-center",
                width: "18px",
                height: "18px",
              },
              {
                type: "tpl",
                tpl: "正在与",
              },
              {
                type: "container",
                className: "current-agent-name",
                body: "@${currentAgent.name}",
              },
              {
                type: "tpl",
                tpl: "对话",
              },
            ],
          },
          {
            type: "container",
            className: "right-area",
            body: [
              {
                type: "button",
                tooltip: "关闭智能体",
                tooltipPlacement: "top",
                body: {
                  type: "icon",
                  icon: "fa-times",
                },
                onEvent: {
                  click: {
                    actions: [
                      {
                        actionType: "setValue",
                        componentId: "ai-helper-page",
                        args: {
                          value: {
                            currentAgent: null,
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
        type: "ai-upload",
        id: "ai-upload",
        className: {
          empty: "${COUNT(files) === 0}",
        },
        isMobile: true,
        onEvent: {
          change: {
            actions: [
              {
                actionType: "setValue",
                componentId: "ai-helper-page",
                args: {
                  value: {
                    files: "${event.data.value}",
                  },
                },
              },
            ],
          },
        },
      },
      {
        visibleOn: "${inputType === 1}",
        type: "container",
        size: "none",
        id: "inputWrapper",
        wrapperCustomStyle: inputCss,
        bodyClassName: "input-wrapper",
        body: [
          {
            type: "image",
            src: "${CONTEXT_ROOT}/ai/icons/ai-${digitalHuman? 'white': 'file-round'}.svg",
            thumbMode: "contain",
            innerClassName: "no-border",
            className: "mr-2",
            width: "22px",
            height: "22px",
            visible:false,
            // visibleOn: "${enableMultimodal}",
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: "uploadClick",
                    componentId: "ai-upload",
                  },
                ],
              },
            },
          },
          {
            type: "form",
            wrapWithPanel: false,
            id: "input-form",
            className: "relative",
            body: [
              {
                name: "inputText",
                id: "inputText",
                type: "ai-input",
                className: "chat-input noAfter",
                borderMode: "none",
                placeholder: "在这里输入问题",
                minRows: 1,
                maxRows: 4,
                maxLength: "${inputMaxNum}",
                disabledOn: "${submiting || !canSubmit}",
                onEvent: {
                  change: {
                    actions: [
                      {
                        actionType: "search",
                        componentId: "input-connection",
                        args: {
                          keyWord: "${event.data.value}",
                        },
                      },
                      {
                        actionType: "setValue",
                        componentId: "ai-helper-page",
                        args: {
                          value: {
                            showAgents: "${ENDSWITH(event.data.value, '@')}",
                          },
                        },
                        expression:
                          "${showAgents !== ENDSWITH(event.data.value, '@')}",
                      },
                    ],
                  },
                  enter: {
                    actions: [
                      {
                        actionType: "close",
                        componentId: "input-connection",
                      },
                      {
                        actionType: "captureScreen",
                        expression: "${summarize}",
                      },
                      // {
                      //   actionType: 'chatSubmit',
                      //   componentId: 'AIConversation',
                      //   args: {
                      //     inputText: '${inputText}',
                      //   },
                      //   expression: '${digitalHuman || !useStream}',
                      // },
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
                          inputText: "${inputText}",
                          imageBase64: "${event.data.imgUrl}",
                          onlineSearch: "${onlineSearchFlag || false}",
                          personalSearch: "${personalSearchFlag || false}",
                        },
                        // expression: '${!digitalHuman && useStream}',
                      },
                    ],
                  },
                },
              },
              {
                type: "icon",
                visibleOn:
                  "${!(ISEMPTY(inputText) || submiting || !canSubmit)}",
                id: "submit-btn",
                icon: "fa-paper-plane",
                className: {
                  absolute: true,
                  "text-primary":
                    "${!(ISEMPTY(inputText) || submiting || !canSubmit)}",
                },
                style: {
                  "font-size": "20px",
                  right: "10px",
                  top: "50%",
                  "margin-top": "-10px",
                  "z-index": "999",
                },
                onEvent: {
                  click: {
                    actions: [
                      {
                        stopPropagation:
                          "${ISEMPTY(inputText) || submiting || !canSubmit}",
                      },
                      {
                        actionType: "captureScreen",
                        expression: "${summarize}",
                      },
                      // {
                      //   actionType: 'chatSubmit',
                      //   componentId: 'AIConversation',
                      //   args: {
                      //     inputText: '${inputText}',
                      //   },
                      //   expression: '${digitalHuman || !useStream}',
                      // },
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
                          inputText: "${inputText}",
                          imageBase64: "${event.data.imgUrl}",
                          onlineSearch: "${onlineSearchFlag || false}",
                          personalSearch: "${personalSearchFlag || false}",
                        },
                        // expression: '${!digitalHuman && useStream}',
                      },
                    ],
                  },
                },
              },
              {
                type: "icon",
                icon: "fa-stop",
                visibleOn: "${submiting}",
                className: "text-primary absolute",
                style: {
                  "font-size": "20px",
                  right: "10px",
                  top: "50%",
                  "margin-top": "-10px",
                  "z-index": "999",
                },
                onEvent: {
                  click: {
                    actions: [
                      {
                        actionType: "eventStreamClose",
                        componentId: "AIConversation",
                        stopPropagation: true,
                        expression: "${submiting}",
                      },
                    ],
                  },
                },
              },
            ],
            onEvent: {
              submit: {
                actions: [
                  // {
                  //   actionType: 'chatSubmit',
                  //   componentId: 'AIConversation',
                  //   args: {
                  //     inputText: '${inputText}',
                  //   },
                  //   expression: '${digitalHuman || !useStream}',
                  // },
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
                      inputText: "${inputText}",
                      onlineSearch: "${onlineSearchFlag || false}",
                      personalSearch: "${personalSearchFlag || false}",
                    },
                    // expression: '${!digitalHuman && useStream}',
                  },
                ],
              },
            },
          },
          {
            type: "image",
            visible:false,
            // visibleOn: "${enableSpeechAssistant}",
            src: "${CONTEXT_ROOT}/ai/icons/microphone${digitalHuman? '-white': ''}.svg",
            thumbMode: "contain",
            innerClassName: "no-border",
            width: "28px",
            height: "28px",
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: "setValue",
                    componentId: "ai-helper-page",
                    args: {
                      value: {
                        inputType: 2,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {
        visibleOn: "${inputType === 2}",
        type: "spinner",
        showOn: "${submiting}",
        overlay: true,
        className: {
          "voice-wrapper": true,
        },
        body: [
          {
            type: "voice-recognition",
            wxSignApi: "/ai/agent/session/wxBaseInfo",
            submiting: "${!!submiting}",
            onEvent: {
              keyboardClick: {
                actions: [
                  {
                    actionType: "setValue",
                    componentId: "ai-helper-page",
                    args: {
                      value: {
                        inputType: 1,
                      },
                    },
                  },
                ],
              },
              success: {
                actions: [
                  // {
                  //   actionType: 'chatSubmit',
                  //   componentId: 'AIConversation',
                  //   args: {
                  //     inputText: '${event.data.translateResult}',
                  //   },
                  //   expression: '${digitalHuman || !useStream}',
                  // },
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
                      inputText: "${event.data.translateResult}",
                      onlineSearch: "${onlineSearchFlag || false}",
                      personalSearch: "${personalSearchFlag || false}",
                    },
                    // expression: '${!digitalHuman && useStream}',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        type: "wrapper",
        className: "mobile-online-area p-0",
        body: [
          {
            name: "onlineSearchFlag",
            type: "checkbox",
            visibleOn: "${enableNetworking}",
            label: false,
            trueValue: true,
            falseValue: false,
            optionType: "button",
            option: {
              type: "html",
              className: "onlineSearch-content",
              html: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1724" width="200" height="200"><path d="M512 89.344a420.5568 420.5568 0 1 0 420.5056 420.5056A421.0176 421.0176 0 0 0 512 89.344z m23.8592 780.7488c-7.8848 0.512-15.872 0.8704-23.8592 0.8704s-15.9744-0.3584-23.9104-0.8704c-46.5408-16.6912-91.8528-80.6912-117.76-177.2544h283.8016c-26.3168 96.5632-71.6288 160.5632-118.1696 177.2544zM358.7584 642.048a783.0016 783.0016 0 0 1-0.8704-260.096h308.3776a750.336 750.336 0 0 1 10.496 127.3856A753.8176 753.8176 0 0 1 665.6 642.048zM150.9888 509.8496a358.4 358.4 0 0 1 23.5008-128h132.0448a819.2 819.2 0 0 0 0.9216 260.096H176.1792a359.1168 359.1168 0 0 1-25.1904-132.096z m333.824-359.936c9.0112-0.6656 18.0736-1.1264 27.2896-1.1264s18.2272 0.4608 27.2384 1.1264c46.08 18.8416 90.7776 84.1216 116.0704 181.248H368.64C394.24 234.0352 438.6304 168.96 484.8128 149.9136z m232.8064 232.0384H849.92a360.3456 360.3456 0 0 1-1.6896 260.096H716.8a799.0784 799.0784 0 0 0 10.8544-132.7104 801.792 801.792 0 0 0-10.0352-127.3856z m108.032-50.7904h-118.1696c-15.36-63.7952-38.7072-118.3232-67.7888-159.0272a363.0592 363.0592 0 0 1 185.9584 159.0272zM384.512 172.1344c-29.1328 40.96-52.48 95.232-67.7888 159.0272H198.5024A363.008 363.008 0 0 1 384.512 172.1344z m-183.552 520.704h117.0432c15.36 62.3104 38.8096 115.456 67.584 155.1872a363.008 363.008 0 0 1-184.6272-155.1872z m437.6064 155.1872c28.7744-39.7312 52.0704-92.8768 67.584-155.1872h117.0432a363.008 363.008 0 0 1-184.6272 155.1872z" fill="currentColor" p-id="1725"></path></svg><span class="online-text">联网搜索</span>',
            },
            className: "onlineSearch",
            onEvent: {
              change: {
                actions: [
                  {
                    actionType: "setValue",
                    componentId: "list-service",
                    args: {
                      value: {
                        onlineSearchFlag: "${event.data.value}",
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            name: "personalSearchFlag",
            type: "checkbox",
            visibleOn: "${enablePersonalDirectory}",
            label: false,
            trueValue: true,
            falseValue: false,
            optionType: "button",
            option: {
              type: "html",
              className: "onlineSearch-content personalSearchFlag",
              html: '<svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox="0 0 16 16" fill="currentColor" xml:space="preserve">\n<path d="M3,12c0,0.4,0.3,0.6,0.6,0.6h2.5c0.4,0,0.6-0.3,0.6-0.6c0-0.4-0.3-0.6-0.6-0.6H3.6C3.3,11.3,3,11.6,3,12z M13.9,13.4h-0.6\n\th0.3c0.2,0,0.4-0.2,0.4-0.4V13.4z M2.2,13.4h0.6H2.6c-0.2,0-0.4-0.2-0.4-0.4V13.4z M13.9,8.6h-0.6h0.3c0.2,0,0.4,0.2,0.4,0.4V8.6z\n\t M12.7,5.4H12h0.3c0.2,0,0.4,0.2,0.4,0.4V5.4z M2.2,3.8h0.6H2.6C2.4,3.8,2.2,4,2.2,4.2V3.8z"/>\n<path d="M14.2,7.3H3.6C3.3,7.3,3,7.6,3,8c0,0.4,0.3,0.6,0.6,0.6h10.3v4.8H2.2V3.8h4.5l0.8,1.3c0.1,0.1,0.1,0.2,0.2,0.2\n\tC7.9,5.4,8,5.4,8.1,5.4h4.6v1c0,0.4,0.3,0.6,0.6,0.6c0.4,0,0.6-0.3,0.6-0.6V5.1c-0.1-0.5-0.5-1-1.1-1H12v0H8.4L7.6,2.8l0,0\n\tC7.5,2.7,7.3,2.5,7,2.5H2.8v0H2C1.4,2.5,0.9,3,0.9,3.6v0h0v10.1c0,0.5,0.4,0.9,0.9,1h12.3c0.5,0,0.9-0.4,1-0.9V8.3\n\tC15.1,7.8,14.7,7.3,14.2,7.3z"/>\n</svg><span class="online-text">个人知识库</span>',
            },
            className: "onlineSearch",
            onEvent: {
              change: {
                actions: [
                  {
                    actionType: "setValue",
                    componentId: "list-service",
                    args: {
                      value: {
                        personalSearchFlag: "${event.data.value}",
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            name: "summarize",
            type: "checkbox",
            label: false,
            trueValue: true,
            falseValue: false,
            optionType: "button",
            option: {
              type: "html",
              className: "onlineSearch-content personalSearchFlag",
              html: '<i class="fa fa-book"></i><span class="online-text">总结此页面</span>',
            },
            className: "onlineSearch ml-2",
            onEvent: {
              change: {
                actions: [
                  {
                    actionType: "setValue",
                    componentId: "list-service",
                    args: {
                      value: {
                        summarize: "${event.data.value}",
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {
        type: "tpl",
        tpl: "${contactInfo}",
        className: "",
        style: {
          "margin-top": "10px",
          "text-align": "center",
          color: "var(--colors-neutral-text-5)",
          display: "block",
          "font-size": "12px",
          "white-space": "nowrap",
          "overflow-x": "auto",
        },
      },
    ],
  },
];
