import React from 'react';
import {
  Renderer,
  RendererProps,
  isPureVariable,
  resolveVariableAndFilter,
  createObject,
  resolveVariable
} from 'amis-core';
import { toast } from "amis-ui";

import type { BaseSchema } from 'amis';
import Amis from "../../components/Amis";
import "./style.scss";

export interface VoiceRecognitionSchema extends Omit<BaseSchema, 'type'> {
  type: 'voice-recognition';
  wxSignApi: any;
  submiting?: boolean;
}
export interface VoiceRecognitionState {
  loading: boolean,
  recording: boolean,
  voiceLocalId: string
}

@Renderer({
  type: 'voice-recognition'
})
export class VoiceRecognitionRenderer extends React.Component<
  Omit<VoiceRecognitionSchema, 'type' | 'className'> & RendererProps
> {

  state: VoiceRecognitionState = {
    recording: false,
    voiceLocalId: '',
    loading: false
  }

  async componentDidMount() {
    const { wxSignApi, env } = this.props;

    this.setState({
      loading: true,
    });

    const { data, status, msg } = await env.fetcher({ url: wxSignApi, data: { url: window.location.href.split('#')[0] } });

    if (status != 0) {
      toast.error(data || msg);
    }

    if (data) {
      this.setState({
        loading: false,
      });
      window.wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: data.appId, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature,// 必填，签名
        jsApiList: ['startRecord', 'stopRecord', 'translateVoice'] // 必填，需要使用的JS接口列表
      });
    }
  }

  voiceEnd() {
    window.wx.onVoiceRecordEnd({
      // 录音时间超过一分钟没有停止的时候会执行 complete 回调
      complete: (res) => {
        this.setState({
          recording: false,
          loading: true,
          voiceLocalId: res.localId
        }, () => {
          this.translateResult();
        });
      },
    });
  }

  translateResult() {
    window.wx.translateVoice({
      localId: this.state.voiceLocalId, // 需要识别的音频的本地Id，由录音相关接口获得，时长不超过1分钟
      isShowProgressTips: 0, // 默认为1，显示进度提示
      success: (res) => {
        console.log("res.translateResult", res.translateResult); // 语音识别的结果,输出的字符串最后有一个句号“。”，用slice删掉
        this.props.dispatchEvent('success', {
          translateResult: res.translateResult
        })
      },
      fail: (error) => {
        console.log("translateResulterror", error)
        toast.warning("语音转换失败");
      },
      complete: () => {
        this.setState({
          loading: false,
        });
      }
    });
  }

  handleRecordClick() {
    if (this.state.recording) {
      console.log('stop')
      window.wx.stopRecord({
        success: (res) => {
          console.log('success', res)
          this.setState({
            voiceLocalId: res.localId,
            loading: true,
          }, () => {
            this.translateResult();
          });
        },
        complete: () => {
          this.setState({
            recording: false,
          });
        }
      })
    } else {
      console.log('start')
      window.wx.startRecord({
        success: (res) => {
          this.setState({
            recording: true,
          });
          this.voiceEnd();
        },
        cancel: () => {
          toast.warning("用户拒绝授权录音")
        },
      });
    }

  }

  handleKeyboardClick() {
    try {
      window.wx.stopRecord()
    } catch (error) {

    }

    this.setState({
      loading: false,
      recording: false
    });

    this.props.dispatchEvent('keyboardClick')
  }

  render() {
    let { classnames: cx, className, submiting, data } = this.props;
    const { loading } = this.state;

    if (isPureVariable(submiting)) {
      submiting = resolveVariableAndFilter(submiting, data);
    }

    return (
      <div className={cx('Voice-bar', className)}>
        <div onClick={this.handleKeyboardClick.bind(this)}>
          <Amis
            schema={{
              type: 'icon',
              className: "text-xl",
              icon: 'fa-circle-o-notch'
            }}
          ></Amis>
        </div>
        {loading || submiting ? <Amis
          schema={
            {
              "type": "spinner",
              "show": true,
            }
          }
        ></Amis> : <div className={`voice-recognition ${this.state.recording ? 'recording' : ''}`} onClick={this.handleRecordClick.bind(this)}>
          <Amis
            schema={this.state.recording ? {
              type: 'container',
              style: {
                "text-align": 'center'
              },
              body: [
                {
                  type: "container",
                  className: "text-black text-xl",
                  body: [
                    {
                      type: 'tpl',
                      tpl: '我在听，请说话'
                    },
                    {
                      "type": "spinner",
                      "show": true,
                      "size": "sm",
                    }
                  ]
                },
                {
                  type: "container",
                  className: "text-secondary text-sm",
                  body: '点击停止录音'
                }
              ]
            } : {
              type: 'icon',
              icon: 'fa-microphone'
            }}
          ></Amis>
        </div>}
        <div onClick={this.handleKeyboardClick.bind(this)}>
          <Amis
            schema={{
              type: 'icon',
              className: "text-xl",
              icon: 'fa-keyboard-o'
            }}
          ></Amis>
        </div>
      </div>
    )
  }
}
