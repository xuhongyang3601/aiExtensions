import React from 'react';
import {
  Renderer,
  RendererProps,
  ActionObject,
  ScopedContext,
  autobind
} from 'amis-core';
import { render } from "amis";

import type { IScopedContext } from 'amis-core';

import type { BaseSchema } from 'amis';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { toast } from 'amis-ui';
import axios from "../../utils/http";

import './style.scss'

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

/**
 * @description: hls视频播放组件
 * @param {*} url：视频地址
 * @param {*} autoPlay：是否自动播放，默认false
 * @param {*} errorFn: 视频播放失败返回函数，返回失败信息
 * @return {*}
 */
const HlsPlayer = ({ url, autoPlay = false, errorFn, dispatchEvent }) => {
  const HlsDOM = useRef();

  useEffect(() => {
    console.log(url)
    const hls = new Hls({
      debug: true
    });
    if (url) {
      hls.loadSource(url);
      hls.attachMedia(HlsDOM.current);

      // 当HLS流的媒体清单被成功解析时
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // 加载媒体清单文件
        hls.startLoad();
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (errorFn) errorFn(event)

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log('fatal network error encountered, try to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('fatal media error encountered, try to recover');
              setTimeout(function () { hls.recoverMediaError(); }, 10);
              break;
            default:
              // cannot recover
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        console.log('FRAG_LOADED:', data);
        dispatchEvent(
          'fragLoad',
          data
        );
      });

      hls.on(Hls.Events.BUFFER_APPENDING, (event, data) => {
        console.log('BUFFER_APPENDING:', data);
      });
    }

    return () => {
      // 销毁
      if (hls) {
        (HlsDOM.current as any)?.pause();
        hls.destroy();
      }
    }
  }, [url]);

  return (
    <div >
      <video
        ref={HlsDOM}
        autoPlay
        controls
      />
    </div>
  );
}

export interface DigitalHumanPlayerSchema extends Omit<BaseSchema, 'type'> {
  type: 'digital-human-player';
  videoSrc: any;
}

@Renderer({
  type: 'digital-human-player',
  autoVar: true,
})
export class DigitalHumanPlayerRenderer extends React.Component<
  Omit<DigitalHumanPlayerSchema, 'type'> & RendererProps
> {
  static contextType = ScopedContext;

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
    console.log(actionType)
  }

  render() {
    const { dispatchEvent, videoSrc } = this.props;
    return (
      <HlsPlayer
        dispatchEvent={dispatchEvent}
        url={videoSrc} // 视频地址
        autoPlay={true} // 是否自动播放，默认false
        errorFn={(err) => { console.log(err); }} // 视频播放失败返回函数
      />
    )
  }
}
