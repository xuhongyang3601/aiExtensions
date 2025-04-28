import React from "react";
import {
  Renderer,
  RendererProps,
  ActionObject,
  ScopedContext,
  createObject,
} from "amis-core";

import type { IScopedContext } from "amis-core";

import type { BaseSchema } from "amis";

import { fetchEventSource } from "@microsoft/fetch-event-source";

import { toast } from "amis-ui";

import { getStore, getGlobal } from "../../utils/store";

export interface EventHandlerSchema extends Omit<BaseSchema, "type"> {
  type: "event-handler";
}

const _window = window as any;

@Renderer({
  type: "event-handler",
})
export class EventHandlerRenderer extends React.Component<
  Omit<EventHandlerSchema, "type"> & RendererProps
> {
  static contextType = ScopedContext;
  messageQueue = []; // 消息队列
  processing = false; // 是否正在处理消息
  currentMessageData = null; //messageData
  constructor(props: any, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);
  }

  /**
   * 动作处理
   */
  doAction(action: ActionObject, args: any) {
    const actionType = action?.actionType as string;

    const presetActions = [
      "streamMessage",
      "streamDone",
      "streamClose",
      "streamError",
    ];

    if (presetActions.includes(actionType)) {
      toast.warning(`${actionType}已被占用，请换一个action名称`);
      return;
    } else if (actionType === "eventStream") {
      this.fetchStream(args);
    } else if (actionType === "eventStreamClose") {
      _window.ctrl?.abort();
      this.messageQueue = [];
      this.props.dispatchEvent(
        `eventStreamCloseEvent`,
        createObject(this.props.data, {
          currentMessageData: this.currentMessageData,
        })
      );
    } else {
      this.props.dispatchEvent(`${actionType}Event`, args);
    }
  }

  fetchStream(args) {
    const { dispatchEvent, data } = this.props;
    _window.ctrl = new AbortController();
    const device = getGlobal("device");
    this.currentMessageData = null;
    const access_token = getStore("uisAccessToken");
    let headers = {
      "Content-Type": "application/json",
      device,
    };
    if (access_token && access_token !== "null") {
      headers["Authorization"] = "Bearer " + access_token;
    }
    let sessionId;
    let messageData;
    if (args.url.startsWith("/dianda")) {
      args.url = args.url.replace("/dianda", "");
    }
    fetchEventSource(getGlobal("baseUrl") + args.url, {
      method: args.method || "get",
      headers: args.headers ? { ...headers, ...args.headers } : headers,
      body:
        args.method && args.method.toLocaleLowerCase() !== "get"
          ? JSON.stringify(args.data || {})
          : undefined,
      signal: _window.ctrl.signal,
      openWhenHidden: true,
      onmessage: (ev) => {
        if (ev.data === "[DONE]") {
          this.messageQueue.push({
            sessionId,
            messageData,
            eventName: "streamDoneEvent",
          });
        } else {
          const response = JSON.parse(ev.data || "{}");
          sessionId = response.data?.sessionId || response?.sessionId;
          messageData = response.data || response;
          this.currentMessageData = messageData;
          this.messageQueue.push(response);
          if (!this.processing) {
            this.processing = true;
            this.processQueue();
          }
        }
      },
      onclose() {
        //连接关闭回调
        console.log("stream close", sessionId);
        setTimeout(() => {
          dispatchEvent(
            `streamCloseEvent`,
            createObject(data, {
              sessionId,
              messageData,
            })
          );
        }, 600);
      },
      onerror(err) {
        //连接出现异常回调
        console.log("stream error", err);
        dispatchEvent(
          `streamErrorEvent`,
          createObject(data, {
            sessionId,
            messageData,
          })
        );
        // 必须抛出错误才会停止
        throw err;
      },
    }).catch((err: any) => {
      console.log({ err });
      toast.warning(err.message);
      throw new Error(err);
    });
  }
  processQueue() {
    if (this.messageQueue.length === 0) {
      this.processing = false;
      return;
    }
    const { dispatchEvent, data } = this.props;
    const messageData = this.messageQueue.shift();
    dispatchEvent(
      messageData.eventName || `streamMessageEvent`,
      createObject(
        data,
        messageData.eventName
          ? { ...messageData }
          : {
              response: messageData,
            }
      )
    );
    setTimeout(() => {
      this.processQueue(); // 递归调用以处理下一个事件数据
    }, 300);
  }
  render() {
    return <div style={{ width: 0, height: 0, visibility: "hidden" }}></div>;
  }
}
