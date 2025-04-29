export default {
  type: "event-handler",
  id: "AIConversation",
  onEvent: {
    clearContextEvent: {
      actions: [
        {
          actionType: "toast",
          args: {
            msgType: "success",
            msg: "清除成功",
            position: "top-center",
          },
          expression:
            "${GETRENDERERDATA('list-service','messageList')[GETRENDERERDATA('list-service','messageList').length - 1].type === 'clear'}",
          stopPropagation:
            "${GETRENDERERDATA('list-service','messageList')[GETRENDERERDATA('list-service','messageList').length - 1].type === 'clear'}",
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/cleanBySessionId?sessionId=${activeCon}",
            method: "post",
            messages: {
              success: "清除成功",
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[{type:'clear'}])}",
            },
          },
          expression: "${event.data.responseResult.responseStatus == 0}",
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
      ],
    },
    chatSubmitEvent: {
      actions: [
        {
          stopPropagation: "${ISEMPTY(event.data.inputText) || submiting}",
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: true,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              detailedQuestionVisible: false,
              currentQuestionId: "${UUID(33)}",
              curInput: "${event.data.inputText}",
              onlineSearch: "${event.data.onlineSearch || false}",
              personalSearch: "${event.data.personalSearch || false}",
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "inputText",
          args: {
            value: "",
          },
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/sensitiveCheck",
            method: "post",
            data: {
              sessionId: "${activeCon}",
              role: "user",
              userMessage: "${GETRENDERERDATA('list-service','curInput')}",
              question: "${GETRENDERERDATA('list-service','curInput')}",
              askId: "${GETRENDERERDATA('list-service','currentQuestionId')}",
            },
            messages: {
              failed: "包含敏感词",
            },
          },
        },
        {
          actionType: "close",
          componentId: "input-connection",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          stopPropagation: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[{userMessage: ${GETRENDERERDATA('list-service','curInput')},role: 'user',messageAmis: {type: 'tpl', tpl: ${GETRENDERERDATA('list-service','curInput')}},id: ${GETRENDERERDATA('list-service','currentQuestionId')}}])}",
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/conversation/stream",
            method: "post",
            data: {
              sessionId: "${activeCon}",
              role: "user",
              userMessage: "${GETRENDERERDATA('list-service','curInput')}",
              askId: "${GETRENDERERDATA('list-service','currentQuestionId')}",
              fileList: "${files || []}",
              agentId: "${currentAgent.id}",
              bizParams: {
                onlineSearch:
                  "${GETRENDERERDATA('list-service','onlineSearch')}",
                personalSearch:
                  "${GETRENDERERDATA('list-service','personalSearch')}",
              },
            },
          },
          outputVar: "resData",
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
        },
        {
          actionType: "clearContext",
          componentId: "AIConversation",
          expression: "${event.data.resData.responseStatus == 5}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${ARRAYFILTER(GETRENDERERDATA('list-service','messageList'), item=>item.id!==GETRENDERERDATA('list-service','currentQuestionId'))}",
            },
          },
          expression: "${event.data.resData.responseStatus != 0}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression: "${event.data.resData.responseStatus != 0}",
        },
        {
          stopPropagation: "${event.data.resData.responseStatus != 0}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: true,
            },
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
            },
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "ajax",
          api: {
            url: "${digitalHumanActionUrl}",
            method: "post",
            data: {
              sessionid: 0,
              text: "${event.data.resData.voiceContent}",
              type: "echo",
            },
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "insertAnswer",
          componentId: "AIConversation",
          args: {
            resData: "${event.data.resData}",
          },
        },
      ],
    },
    feedbackClickEvent: {
      actions: [
        {
          actionType: "toast",
          args: {
            msgType: "warning",
            msg: "正在生成答案，请稍后再操作",
          },
          expression: "${submiting}",
          stopPropagation: "${submiting}",
        },
        {
          actionType: "ajax",
          api: {
            url: "${url}",
            method: "post",
            data: {
              sessionId: "${activeCon}",
              messageId: "${event.data.id}",
              answerMessageId: "${event.data.id}",
              feedbackType: "${event.data.feedbackType}",
            },
          },
        },
        {
          stopPropagation: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/chatLog?sessionId=${activeCon}",
            responseData: {
              messageList: "$items",
            },
            data: {},
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList: "${event.data.responseResult.messageList}",
            },
          },
        },
      ],
    },
    optionClickEvent: {
      actions: [
        {
          stopPropagation: "${submiting}",
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: true,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
        {
          actionType: "eventStream",
          componentId: "AIConversation",
          args: {
            url: "/dianda/ai/qa/conversation/stream",
            method: "post",
            data: {
              userMessage: "选择答案",
              sessionId: "${activeCon}",
              answerMessageId:
                "${GETRENDERERDATA('ai-helper-page','currentMessage')}",
              selectIndex: "${event.data.selectIndex}",
            },
          },
          expression: "${!digitalHuman && useStream}",
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/conversation/stream",
            method: "post",
            data: {
              userMessage: "选择答案",
              sessionId: "${activeCon}",
              answerMessageId:
                "${GETRENDERERDATA('ai-helper-page','currentMessage')}",
              selectIndex: "${event.data.selectIndex}",
            },
          },
          outputVar: "resData",
          expression: "${digitalHuman || !useStream}",
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
        {
          stopPropagation: "${!digitalHuman && useStream}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
        },
        {
          actionType: "clearContext",
          componentId: "AIConversation",
          expression: "${event.data.resData.responseStatus == 5}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${ARRAYFILTER(GETRENDERERDATA('list-service','messageList'), item=>item.id!==GETRENDERERDATA('list-service','currentQuestionId'))}",
            },
          },
          expression: "${!event.data.resData.id}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression: "${!event.data.resData.id}",
        },
        {
          stopPropagation: "${!event.data.resData.id}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
            },
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "ajax",
          api: {
            url: "${digitalHumanActionUrl}",
            method: "post",
            data: {
              sessionid: 0,
              text: "${event.data.resData.voiceContent}",
              type: "echo",
            },
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "insertAnswer",
          componentId: "AIConversation",
          args: {
            resData: "${event.data.resData}",
          },
        },
      ],
    },
    clickAppEvent: {
      actions: [
        {
          actionType: "custom",
          script:
            "const isMobile = window.matchMedia('(max-width: 768px)').matches;const obj={ 'actionType': 'url', 'args': { 'url': isMobile?event.data.app:event.data.pc, 'blank': true } };doAction(obj)",
        },
      ],
    },
    streamChatSubmitEvent: {
      actions: [
        {
          stopPropagation: "${ISEMPTY(event.data.inputText) || submiting}",
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: true,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              detailedQuestionVisible: false,
              currentQuestionId: "${UUID(33)}",
              curInput: "${event.data.inputText}",
              onlineSearch: "${event.data.onlineSearch  || false}",
              personalSearch: "${event.data.personalSearch || false}",
              pageImgUrl: "${event.data.pageImgUrl}",
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "inputText",
          args: {
            value: "",
          },
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/sessionItem/sensitiveCheck",
            method: "post",
            data: {
              sessionId: "${activeCon}",
              role: "user",
              userMessage: "${GETRENDERERDATA('list-service','curInput')}",
              question: "${GETRENDERERDATA('list-service','curInput')}",
              askId: "${GETRENDERERDATA('list-service','currentQuestionId')}",
            },
            messages: {
              failed: "包含敏感词",
            },
          },
        },
        {
          actionType: "close",
          componentId: "input-connection",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          stopPropagation: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[{userMessage: ${GETRENDERERDATA('list-service','curInput')},role: 'user',messageAmis: {type: 'tpl', tpl: ${GETRENDERERDATA('list-service','curInput')}},id: ${GETRENDERERDATA('list-service','currentQuestionId')}}])}",
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 100);
          },
        },
        {
          actionType: "eventStream",
          componentId: "AIConversation",
          args: {
            url: "/dianda/ai/agent/sessionItem/conversation/stream",
            method: "post",
            data: {
              sessionId: "${activeCon}",
              role: "user",
              userMessage: "${GETRENDERERDATA('list-service','curInput')}",
              askId: "${GETRENDERERDATA('list-service','currentQuestionId')}",
              fileList: "${files || []}",
              agentId: "${currentAgent.id}",
              bizParams: {
                pageImgUrl: "${GETRENDERERDATA('list-service','pageImgUrl')}",
                onlineSearch:
                  "${GETRENDERERDATA('list-service','onlineSearch')}",
                personalSearch:
                  "${GETRENDERERDATA('list-service','personalSearch')}",
              },
            },
          },
        },
        {
          actionType: "broadcast",
          args: {
            eventName: "broadcast_voiceClick",
          },
          data: {
            id: "",
          },
        },
        {
          actionType: "custom",
          script: () => {
            window.speechSynthesis && window.speechSynthesis.cancel();
          },
        },
      ],
    },
    streamMessageEvent: {
      actions: [
        {
          actionType: "close",
          componentId: "input-connection",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
          expression:
            "${event.data.response.status && event.data.response.status != 0}",
        },
        {
          actionType: "clearContext",
          componentId: "AIConversation",
          expression: "${event.data.response.status == 5}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${ARRAYFILTER(GETRENDERERDATA('list-service','messageList'), item=>item.id!==GETRENDERERDATA('list-service','currentQuestionId'))}",
            },
          },
          expression:
            "${event.data.response.status && event.data.response.status != 0}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression:
            "${event.data.response.status && event.data.response.status != 0}",
        },
        {
          stopPropagation:
            "${event.data.response.status && event.data.response.status != 0}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: true,
              statusText: "${event.data.response.data.name}",
            },
          },
          expression: "${event.data.response.data.type === 'step'}",
          stopPropagation: "${event.data.response.data.type === 'step'}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              streaming: true,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "message-wrapper",
          args: {
            value: {
              streamData: "${event.data.response.data}",
            },
          },
        },
        {
          actionType: "human",
          componentId: "dhplayer",
          args: {
            text: "${event.data.response.data.voiceContent}",
            type: "echo",
            answerData: "${event.data.response.data.voiceContent}",
          },
          expression: "${digitalHuman}",
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 600);
          },
        },
      ],
    },
    eventStreamCloseEvent: {
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
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              streaming: false,
              robotLoading: false,
              statusText: "",
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[${event.data.currentMessageData}])}",
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              let loadingIcons = document.querySelectorAll(
                ".cxd-AiMessage--robot .step-header>i.fa-spinner"
              );
              for (let i = 0; i < loadingIcons.length; i++) {
                loadingIcons[i].className =
                  "fa-check-circle-o text-success fa fa-fa-check-circle-o";
              }
            }, 600);
          },
        },
      ],
    },
    streamDoneEvent: {
      actions: [
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              streaming: false,
              robotLoading: false,
              statusText: "",
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[${event.data.messageData}])}",
            },
          },
          expression: "${event.data.messageData}",
        },
        {
          actionType: "custom",
          script: () => {
            setTimeout(() => {
              const messageWrapper = document.querySelector(".message-wrapper");
              messageWrapper.scrollTop = messageWrapper.scrollHeight;
            }, 600);
          },
        },
        {
          actionType: "reload",
          componentId: "aside-wrapper",
          expression: "${!activeCon}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
              activeCon: "${event.data.sessionId}",
            },
          },
        },
        {
          actionType: "custom",
          script:
            'setTimeout(() => {const isMobile = window.matchMedia("(max-width: 768px)").matches;if(!isMobile){doAction({"actionType": "focus","componentId": "inputText"})}}, 500)',
        },
      ],
    },
    streamErrorEvent: {
      actions: [
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
        },
      ],
    },
    addSessionEvent: {
      actions: [
        {
          actionType: "ajax",
          api: {
            url: "/ai/agent/session/add",
            method: "post",
            data: {
              agentId: "${event.data.agentId}",
            },
          },
        },
        {
          stopPropagation: "${event.data.responseResult.responseStatus != 0}",
        },
        {
          actionType: "clear",
          componentId: "ai-upload",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              conversationType: "agent",
              activeCon: "${event.data.responseResult.responseData.id}",
              iconUrl: "${event.data.responseResult.responseData.iconUrl}",
              agentName: "${event.data.responseResult.responseData.agentName}",
              agentId: "${event.data.responseResult.responseData.agentId}",
            },
          },
        },
        {
          actionType: "reload",
          componentId: "session-wrapper",
        },
        {
          actionType: "focus",
          componentId: "inputText",
        },
        {
          actionType: "cancel",
          componentId: "bbx",
        },
      ],
    },
    setDigitalHumanSrcEvent: {
      actions: [
        {
          stopPropagation: "${!event.data.answer}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              videoLoading: true,
            },
          },
        },
        {
          actionType: "ajax",
          api: {
            url: "/ai/api/digitalHuman/answerToVideoTest",
            method: "post",
            data: {
              answer: "${event.data.answer}",
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              videoSrc: "${event.data.responseData.result}",
              videoLoading: false,
            },
          },
        },
      ],
    },
    insertAnswerEvent: {
      actions: [
        {
          actionType: "close",
          componentId: "input-connection",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              robotLoading: false,
            },
          },
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              messageList:
                "${CONCAT(GETRENDERERDATA('list-service','messageList'),[${event.data.resData}])}",
            },
          },
        },
        {
          actionType: "custom",
          script:
            "setTimeout(() => {const messageWrapper = document.querySelector(`.message_${event.data.resData.id}`);messageWrapper.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'})}, 600)",
        },
        {
          actionType: "custom",
          script:
            'setTimeout(() => {if(!event.context.env.useMobileUI){doAction({"actionType": "focus","componentId": "inputText"})}}, 500)',
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              submiting: false,
            },
          },
          expression: "${!event.data.stream}",
        },
        {
          actionType: "reload",
          componentId: "aside-wrapper",
          expression: "${!activeCon}",
        },
        {
          actionType: "setValue",
          componentId: "ai-helper-page",
          args: {
            value: {
              activeCon: "${event.data.resData.sessionId}",
            },
          },
          expression: "${!activeCon && !event.data.stream}",
        },
        {
          actionType: "setValue",
          componentId: "list-service",
          args: {
            value: {
              detailedQuestionVisible: true,
              robotLoading: false,
            },
          },
          expression: "${event.data.responseResult.responseStatus == 0}",
        },
      ],
    },
    newSetDigitalHumanSrcEvent: {
      actions: [
        {
          actionType: "ajax",
          api: {
            url: "https://u359243-b58d-4154cd98.bjb1.seetacloud.com:8443/human",
            method: "post",
            data: {
              text: "${event.data.answer}",
              type: "echo",
            },
          },
        },
      ],
    },
  },
};
