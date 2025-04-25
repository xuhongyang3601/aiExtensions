import React from 'react';
import {
  Renderer,
  RendererProps,
  ActionObject,
  ScopedContext,
  RootClose,
  autobind
} from 'amis-core';

import type { IScopedContext } from 'amis-core';

import type { BaseSchema } from 'amis';

import { Icon, TooltipWrapper } from 'amis-ui';
import debounce from "lodash/debounce";

import './style.scss';

export interface AiInputConnectionSchema extends Omit<BaseSchema, 'type'> {
  type: 'ai-input-connection';
}

@Renderer({
  type: 'ai-input-connection',
  autoVar: true,
})
export class AiInputConnectionRenderer extends React.Component<
  Omit<AiInputConnectionSchema, 'type'> & RendererProps
> {
  static contextType = ScopedContext;

  constructor(props: any, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  fetchCancel: Function | null = null;

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);

    this.fetchCancel = null;
  }

  componentDidUpdate(prevProps: Readonly<Omit<AiInputConnectionSchema, 'type'> & RendererProps>): void {

  }

  state = {
    isOpened: false,
    data: null,
    keyWord: ""
  }

  /**
 * 动作处理
 */
  doAction(action: ActionObject, args: any) {
    const actionType = action?.actionType as string;
    if (actionType === 'search') {
      const keyWord = args.keyWord?.replace(/\s+/g, "") || ''
      console.log(this.props)
      debounce(this.handleSearch(keyWord), 1000)
    } else if (actionType === 'close') {
      this.close()
    }
  }

  @autobind
  async handleSearch(keyWord: string) {
    const { env } = this.props
    this.setState({
      keyWord,
      data: []
    })

    if (this.fetchCancel) {
      this.fetchCancel?.('guessSearch request cancelled.');
      this.fetchCancel = null;
    }

    if (keyWord.length > 1 && keyWord.length <= 20) {
      const { data } = await env.fetcher(
        {
          url: "/ai/qa/conversation/guessSearch",
          data: {
            keyWord
          }
        },
        null,
        {
          cancelExecutor: (executor: Function) => (this.fetchCancel = executor)
        }
      )

      this.fetchCancel = null;

      this.setState({
        data,
        isOpened: data?.app?.length || data?.qa?.length
      })
    } else {
      this.close()
    }
  }

  @autobind
  close() {
    this.setState({
      isOpened: false,
      data: null
    })
  }

  @autobind
  open() {
    this.setState({
      isOpened: true
    })
  }

  @autobind
  handleSelfClose() {
    this.close()
  }

  @autobind
  handleClick(val) {
    this.close()
    if (val) {
      this.props.dispatchEvent('select', {
        value: val
      })
    }
  }

  @autobind
  handleClickApp(app) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const url = isMobile && app.appUrl ? app.appUrl : app.pcUrl;  // 可能没有移动端的地址
    if (url) {
      window.open(url, '_blank')
    }
  }

  @autobind
  handleClickFile(item) {
    if (item.knowledgeId) {
      // this.props.onAction(
      //   null,
      //   {
      //     "actionType": "ajax",
      //     "api": {
      //       responseType: "blob",
      //       "url": `/ai/knowledge/detail/download?id=${item.knowledgeId}`,
      //       "method": "get",
      //     }
      //   }
      // )
      this.props.dispatchEvent('download', {
        value: item.downloadUrl
      })
    }
  }

  render() {
    const { isOpened, data, keyWord } = this.state;
    const { classnames: cx, className, data: propsData, env } = this.props;

    return (
      isOpened && data ? <RootClose
        disabled={!this.state.isOpened}
        onRootClose={this.close}
      >
        {(ref: any) => {
          return (
            <div
              ref={ref}
              className={cx(
                'input-connection',
                className
              )}
            >
              <div className="input-connection-header">
                <div className="input-connection-header-btn">
                  <a
                    data-tooltip={'关闭'}
                    onClick={this.handleSelfClose}
                    className={cx('Modal-close')}
                  >
                    <Icon
                      icon="close"
                      className="icon"
                      iconContent="Dialog-close"
                    />
                  </a>
                </div>
              </div>
              <div className="input-connection-body">
                {
                  data.qa?.length ? <div className="input-connection-body-item">
                    <div className="input-connection-body-item-title">
                      猜你想问
                    </div>
                    <div className="input-connection-body-item-content">
                      {
                        data?.qa?.map((item: any, index) => {
                          return (
                            <div className="input-connection-body-item-content-item" key={item}
                              onClick={() => {
                                this.handleClick(item)
                              }}
                            >
                              {index + 1 + '.'}
                              {item.split('').map((character, i) => <span key={i} className={["input-connection-body-item-content-item-character", keyWord.includes(character) ? "keyword" : ""].join(' ')}>{character}</span>)}
                            </div>
                          )
                        })
                      }
                    </div>
                  </div> : null
                }
                {
                  data.app?.length ? <div className="input-connection-body-item">
                    <div className="input-connection-body-item-title">
                      猜你想用
                    </div>
                    <div className="input-connection-body-item-app">
                      {
                        data?.app?.map((item: any, index) => {
                          return (
                            <div className="input-connection-body-item-app-item" key={item.appName}
                              onClick={() => {
                                this.handleClickApp(item)
                              }}
                            >
                              <img src={item.appIconUrl || (propsData.CONTEXT_ROOT + propsData.__super?.appIconUrl)} alt="" />
                              <TooltipWrapper
                                placement="top"
                                delay={1000}
                                tooltip={item.appName}
                              >
                                <div>{item.appName}</div>
                              </TooltipWrapper>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div> : null
                }
                {
                  data.file?.length ? <div className="input-connection-body-item">
                    <div className="input-connection-body-item-title">
                      猜你想找
                    </div>
                    <div className="input-connection-body-item-app">
                      {
                        data?.file?.map((item: any, index) => {
                          return (
                            <div className="input-connection-body-item-app-item" key={item.fileName}
                              onClick={() => {
                                if (!item.downloadUrl) {
                                  return
                                }
                                this.handleClickFile(item)
                              }}
                            >
                              <img className="file_img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAAAAXNSR0IArs4c6QAAAiVJREFUOE99VNtqFEEQPRUUCQYfgrjERBIJJoiQT0jYN4P6PYKKOII34saY625CLiia7xB8EvwBEfRZ8Be6tG49PbuT9NNMdfeprlPnFJ0O+BcRZsEACLqYQQSw/Os36W5eUzdQraxSVcboc5+T389xuSwgChbADiZ71+fA/7cbYPRpj1MgKIAveUV+TcQ9NjOXE1Tde/Yy+rjNHJc0MFRG+XzWbfD0bFEyo+o+oEqA8ouijABkY0ZeqQwGb51p4MJFT8G6WdGHLU5BpRFSkxsMC4KciVJz3MKagE7eG5D8pZYOWRuDuPpmPuvdpuN3XlrQ7JcE2xPoUSmTxsAhE05NWdBhz5gIwudvA1c7JcX2XTbk25emrrTkw7ecBMnrx/Jd4NadUaAyctST405OMsnQwRqn0I9kvTwBXBr3zUIKpcL//qlh8939N1JtbYvoQnkxYg2VF/ZRvgavjexAvrkAnrzWVLi5zpaU9P3rqHBp76V5TdsJoHsfWFw6n6P+K/Wa+8QkS7svvP2uB+nYxJWaozb3//6hFeRpoWTvPOek8GGBugRVbEwC90rTNAIlDRESNysWHDGuceCzSAl2t3ty63ibqRXoWdO0hUsDyEKR2boVCVX/mnzjqb1omN4sgzNKLrpopt14UuuonIrZUz4t4yKZ29w3mXSi9cf1qFWj+utKDxeCtJnUsqj3iB8S0BFVko+RECcTeKxlZgvhel6Y0w/8/AfZBTM/V8jj2wAAAABJRU5ErkJggg==" alt="" />
                              <TooltipWrapper
                                placement="top"
                                delay={1000}
                                tooltip={!item.downloadUrl ? "无预览与下载权限" : item.fileName}
                              >
                                <div>{item.fileName}</div>
                              </TooltipWrapper>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div> : null
                }
              </div>
            </div>
          );
        }}
      </RootClose> : null
    )
  }
}
