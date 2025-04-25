import React from "react";
import {
  Renderer,
  RendererProps,
  isPureVariable,
  resolveVariableAndFilter,
  createObject,
  ActionObject,
  ScopedContext,
  autobind,
} from "amis-core";
import type { IScopedContext } from "amis-core";
import { TooltipWrapper as TooltipWrapperComp } from "amis-ui";

import "./style.scss";

import type { BaseSchema, SchemaCollection } from "amis";
import { Button, Icon as IconUI, toast } from "amis-ui";

export interface AiMessageAgentSchema extends Omit<BaseSchema, "type"> {
  type: "ai-message-agent";

  renderType?: "amis" | "schema";

  /* 机器人消息类型 */
  robot?: boolean;

  /* 是否可以重新生成 */
  canRegenerate?: boolean;

  isMobile?: boolean;

  canFeedback?: boolean;

  hideTools?: boolean;

  config: object;

  answerFeedbackType?: null | string;

  messageId?: string;

  contactWay?: string;

  responsibleDepartment?: string;

  portrait?: string;

  /**
   * 内容区域
   */
  body: SchemaCollection;
}

export interface btnObj {
  name: string;
  icon: string;
  eventName: string;
}

export interface stateType {
  speechStatus: "none" | "speaking" | "pausing";
  speechIcon: "up" | "down";
  speakInterval: any;
  hasSpeechContent: boolean;
  html: string;
}

@Renderer({
  type: "ai-message-agent",
})
export class AiMessageAgentRenderer extends React.Component<
  Omit<AiMessageAgentSchema, "type" | "className"> & RendererProps
> {
  static contextType = ScopedContext;

  constructor(props: any, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      window.speechSynthesis && window.speechSynthesis.cancel();
      clearInterval(this.state.speakInterval);
      this.setState({
        speechIcon: "up",
      });
    };
    let { data, body } = this.props;
    if (isPureVariable(body)) {
      body = resolveVariableAndFilter(body, data);
    }
    if (typeof body === "string") {
      this.setState({
        hasSpeechContent: body.includes("speech_content"),
      });
    }
  }

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);

    window.speechSynthesis && window.speechSynthesis.cancel();

    window.onbeforeunload = null;

    clearInterval(this.state.speakInterval);
    this.setState({
      speechIcon: "up",
    });
  }

  btns: btnObj[] = [
    {
      name: "thumbsUp",
      icon: "fa fa-thumbs-o-up",
      eventName: "thumbsUpClick",
    },
    {
      name: "thumbsDown",
      icon: "fa fa-thumbs-o-down",
      eventName: "thumbsDownClick",
    },
  ];

  state: stateType = {
    speechStatus: "none",
    speechIcon: "up",
    speakInterval: null,
    hasSpeechContent: false,
    html: "",
  };

  renderBody(): JSX.Element | null {
    let { renderType, body, render, disabled, robot, data, dispatchEvent } =
      this.props;

    if (isPureVariable(renderType)) {
      renderType = resolveVariableAndFilter(renderType, data);
    }

    if (renderType === "schema") {
      return render(
        "body",
        {
          type: "amis",
          schema: body,
        },
        { disabled }
      ) as JSX.Element;
    }

    return render(
      "body",
      {
        type: "amis",
        name: body,
      },
      { disabled }
    ) as JSX.Element;
  }

  handleFeedbackClick(eventName: string, isActive: boolean, btnName: string) {
    const { data, dispatchEvent, onAction, onEvent } = this.props;

    dispatchEvent(
      "feedbackClick",
      createObject(data, {
        eventName,
        isActive,
        feedbackType: isActive ? "thumbsCancel" : btnName,
      })
    );
  }

  /**
   * 动作处理
   */
  doAction(action: ActionObject, args: any) {
    const actionType = action?.actionType as string;
    let { data, messageId } = this.props;
    if (isPureVariable(messageId)) {
      messageId = resolveVariableAndFilter(messageId, data);
    }

    if (actionType === "checkVoiceId") {
      if (args.voiceId !== messageId) {
        clearInterval(this.state.speakInterval);
        this.setState({
          speechStatus: "none",
          speechIcon: "up",
        });
      }
    }
  }

  setSpeechIcon() {
    const speakInterval = setInterval(() => {
      console.log("speaking...", this.state.speechIcon);
      this.setState({
        speechIcon: this.state.speechIcon === "up" ? "down" : "up",
      });
    }, 500);
    this.setState({
      speakInterval,
    });
    return speakInterval;
  }

  @autobind
  findMarkdownValue(jsonData) {
    const markdownNodes = [];

    function traverse(data) {
      if (data && typeof data === "object") {
        if (data.type === "markdown") {
          markdownNodes.push(data.value);
        }

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            traverse(data[key]);
          }
        }
      }
    }

    traverse(jsonData);

    return markdownNodes.length
      ? markdownNodes[markdownNodes.length - 1]
      : undefined;
  }

  @autobind
  docJump() {
    const { data, dispatchEvent, body } = this.props;
    dispatchEvent(
      "docJump",
      createObject(data, {
        markdown: this.findMarkdownValue(JSON.parse(data.messageAmis)),
      })
    );
  }

  handleVoiceClick() {
    if (!window.SpeechSynthesisUtterance || !window.speechSynthesis) {
      toast.warning("您的浏览器不支持此功能");
      return;
    }

    let { data, messageId, dispatchEvent } = this.props;

    if (isPureVariable(messageId)) {
      messageId = resolveVariableAndFilter(messageId, data);
    }

    dispatchEvent(
      "voiceClick",
      createObject(data, {
        id: messageId,
      })
    );

    const { speechStatus } = this.state;

    clearInterval(this.state.speakInterval);
    this.setState({
      speechIcon: "up",
    });

    let _speechStatus;

    if (speechStatus === "none") {
      const speechContent = window.document
        .getElementById(messageId)
        ?.querySelector(".speech_content")
        ?.innerHTML?.replace(/<([^>]+)>/gi, "");

      window.speechSynthesis && window.speechSynthesis.cancel();
      const ssu = new SpeechSynthesisUtterance();
      ssu.text = speechContent;
      ssu.rate = 1;
      ssu.lang = "zh-CN";
      ssu.volume = 1;
      ssu.pitch = 1;

      ssu.onend = () => {
        clearInterval(this.state.speakInterval);
        this.setState({
          speechStatus: "none",
          speechIcon: "up",
        });
      };

      window.speechSynthesis.speak(ssu);

      this.setSpeechIcon();

      _speechStatus = "speaking";
    } else if (speechStatus === "speaking") {
      window.speechSynthesis.pause();

      _speechStatus = "pausing";
    } else if (speechStatus === "pausing") {
      window.speechSynthesis.resume();
      this.setSpeechIcon();

      _speechStatus = "speaking";
    }

    this.setState({
      speechStatus: _speechStatus,
    });
  }

  render() {
    let {
      classnames: cx,
      className,
      robot,
      data,
      answerFeedbackType,
      messageId,
      canRegenerate,
      renderType,
      canFeedback,
      hideTools,
      isMobile,
      body,
      contactWay,
      responsibleDepartment,
      portrait,
      showDocStatus,
    } = this.props;
    if (isPureVariable(robot)) {
      robot = resolveVariableAndFilter(robot, data);
    }
    if (isPureVariable(answerFeedbackType)) {
      answerFeedbackType = resolveVariableAndFilter(answerFeedbackType, data);
    }
    if (isPureVariable(canRegenerate)) {
      canRegenerate = resolveVariableAndFilter(canRegenerate, data);
    }
    if (isPureVariable(renderType)) {
      renderType = resolveVariableAndFilter(renderType, data);
    }
    if (isPureVariable(canFeedback)) {
      canFeedback = resolveVariableAndFilter(canFeedback, data);
    }
    if (isPureVariable(hideTools)) {
      hideTools = resolveVariableAndFilter(hideTools, data);
    }
    if (isPureVariable(messageId)) {
      messageId = resolveVariableAndFilter(messageId, data);
    }
    if (isPureVariable(body)) {
      body = resolveVariableAndFilter(body, data);
    }
    if (isPureVariable(contactWay)) {
      contactWay = resolveVariableAndFilter(contactWay, data);
    }
    if (isPureVariable(responsibleDepartment)) {
      responsibleDepartment = resolveVariableAndFilter(
        responsibleDepartment,
        data
      );
    }
    if (isPureVariable(portrait)) {
      portrait = resolveVariableAndFilter(portrait, data, "| url_decode");

      console.log("portrait:", portrait, typeof portrait);
    }

    // 写作助手开关
    if (isPureVariable(showDocStatus)) {
      showDocStatus = resolveVariableAndFilter(showDocStatus, data);
      showDocStatus = JSON.parse(showDocStatus);
    }

    const firstName =
      JSON.parse(
        window.sessionStorage.getItem("userInfo") || "{}"
      ).name?.substring(0, 1) || "A";

    const { speechStatus, speechIcon, hasSpeechContent } = this.state;

    console.log("robot:", robot);

    return (
      <div
        id={messageId || ""}
        className={cx(
          "AiMessage",
          robot ? `AiMessage--robot` : "",
          isMobile ? "AiMessage-mobile" : "",
          className
        )}
      >
        <div className={cx("AiMessage_portrait")}>
          {/* <IconUI icon={robot ? 'fa fa-cloud' : 'fa fa-user-circle'} /> */}
          {robot ? (
            <img
              className="rounded-full"
              src={
                portrait && portrait !== "undefined" && portrait !== "null"
                  ? data.CONTEXT_ROOT + portrait
                  : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATUSURBVHgBlVZNaFxVFD7nvjdpYxfNgAF3Tly4deqqNIKhUly4SKJglybagJZiEX8iLSEpBVHUhSJSEIuiVRfWTFYuXHSKG1d1trqwExVaaaVTaTOZzLx7PPeec9+7bxL689rJu+/+nO+c7/xdhHt4jpzsToFJpjNrpyDBh4moSgYJgG5ahBaAaVGSrX29NNq8myy80+LCie4c71gmhJrlATEGuTcjgQHkOf50szyBSLy6jsasnFsa+fK+AF9e7NYoMasWqQ5emEPQt/8hWJZODkwl5GusAb/bMLAHvzs12h6WbbaBvX1rjhK4RGDrQB4HKLxl7P+wQShY3kB+lXSfoIq59Pzp3swdLXzlrd4MJXbVjW1kFXg6Zc4JJtWEWF1vqaiOYc7RbuU4ZIDz5yOKMaYRDVtGOEa5X2SHVQus+JB0zf3bke5cIRl3+n3a11B6TcTtBd4xBsErwTdOLmqggKCgpw+VbqW0fEj3eEXHKiPJaoQDcPRNjkaAmidHj79+ZAQOP5OKTCrEkQwwRKcq5bzqyf3oWAU+fnVEbBR3kIuH597ZeiEHZCqXVRv0mrOsRycMPHUghflnU/UiFPHoxAsujVcBaw9Jrriz42MI43uxiDCyIhPIY5hji5zUxNaJqiTeody3Bx5PHChEvInWvPdBdsDxwxVYmK7AeBXF8hK7OQnua2LmdHcqZR9MQ0ROEOj+/HVFvicZ1B05uzpQWglxKIP37Aa81vECMHIAxumSJul0yt91py0a9Fyq+X7XxibBp+f68MZLIzC5L/Hf3/yYkTqGrncIP1sbwK0e+TGU0ixWXv5naKcMn3vMzVob0juiggT0g8+34LfLNigcNPLK/XnVwr83JHBKJlNkJfiscjbVUt5WJZ1QHQsSZD9t9ADfP9vnfBQOxqsGXSioVSAZByHZMXYLSeqir8FEe43MeUm5TqUHpbT5PSg5+ATT+/T+uCrqWSwfxxDa0ULKeztclapW+SQtyhGefElUwqHJFA7tT/za7U2An1sWrv1X4iUcRE1gXxdV4k3Do/XIedu0lIakyAbh9kaxd89uk2upKVU+6A9FmYLYclnd5JV6ntYk1EHEbpi7foNgrWnpgdEMuz2gH5oD1CKvvsOShQLrI82Ds5xWShmtQYrHZQEgTvpwjkJQuArD/P/0SwbWhG1IoTX7ANukUGRFB+9qSTc+3TCffMjXAuJOrYeHSkqZIV3n6ORUsJjTme8BWP+H/E8jhnVxtLsfra+eqFwUfMpOhdIfDv/+h4W/rxTJixiVLipzoJ3Ez7YZrH01uJMixnBFdutzdHHzV16s29DPtCXlzRV9s417pHcCaQeL+6L2T6Ji/vL3J3c9IqL04bSY5TDuFBRpC1WrNMQJi0o5nGIakeHuockE0Bls2YNhSw545r3RNu98LT+u7aYAQwogVFxyZFjEsweKmjKXTJhvRJep0iXqzLujXyCYWda0E6zwhT3UOBSEYLa8MOr6knco1wJmC+fOL+1qxBjbKpl7/DXR4AWWUws+9Xea3F9IVm8c4jO5nzrfueKQAbRwYGd3uibuCBieF/nKmJhkmUFrLtkcgB0KkvwyLN9tviGvfLt8nxfh4Wdhqf9kZmmGjK1rVRpTgA4r02b8JjPQ+Gq5cvFusv4HJDSmcsKKkcEAAAAASUVORK5CYII="
              }
              alt=""
            />
          ) : (
            firstName
          )}
        </div>
        <div className={cx("AiMessage_container")}>
          <div className="msg_body_container">
            <div className={cx("AiMessage_container_content")}>
              {this.renderBody()}
            </div>
            {/* 中断内容不显示底部工具栏 */}
            {robot && !hideTools && this.props.data.id ? (
              <div className={cx("AiMessage_container_tools")}>
                <div className="left-area"></div>
                <div className="right-area">
                  {/* {
                    window.SpeechSynthesisUtterance && hasSpeechContent ? <div
                      className={[
                        'right-area-btn',
                        speechStatus
                      ].join(' ')}
                      onClick={this.handleVoiceClick.bind(this)}
                      style={{ width: '25px' }}
                    >
                      {
                        speechStatus === 'pausing' ?
                          <IconUI icon={'fa fa-volume-off'} vendor="" /> :
                          <IconUI icon={`fa fa-volume-${speechIcon}`} vendor="" />
                      }
                    </div> : null
                  } */}
                  {this.btns.map((item) => (
                    <div
                      key={item.name}
                      className={[
                        "right-area-btn",
                        answerFeedbackType === item.name ? "active" : "",
                      ].join(" ")}
                      onClick={() => {
                        this.handleFeedbackClick(
                          item.eventName,
                          answerFeedbackType === item.name,
                          item.name
                        );
                      }}
                    >
                      <IconUI icon={item.icon} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {contactWay && responsibleDepartment && robot ? (
            <div className="tips">{`答案由AI生成，有任何疑问可咨询${responsibleDepartment}，联系方式: ${contactWay}`}</div>
          ) : null}
        </div>
      </div>
    );
  }
}
