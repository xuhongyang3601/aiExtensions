import React from 'react';
import {
  Renderer,
  RendererProps,
  ActionObject,
  ScopedContext,
  createObject,
  autobind,
} from 'amis-core';
import { render } from 'amis';

import type { IScopedContext } from 'amis-core';
import { TooltipWrapper as TooltipWrapperComp } from 'amis-ui';
import type { BaseSchema } from 'amis';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { toast } from 'amis-ui';

import './style.scss';

export interface AiUploadSchema extends Omit<BaseSchema, 'type'> {
  type: 'ai-upload';
}

@Renderer({
  type: 'ai-upload',
  autoVar: true,
})
export class AiUploadRenderer extends React.Component<
  Omit<AiUploadSchema, 'type'> & RendererProps
> {
  static contextType = ScopedContext;

  constructor(props: any, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  state = {
    fileLength: 0,
    files: [],
    ref: null,
  };

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);

    // window.speechSynthesis.cancel();
  }

  /**
   * 动作处理
   */
  doAction(action: ActionObject, args: any) {
    const actionType = action?.actionType as string;
    console.log(actionType);
    if (actionType === 'clear') {
      const uploader =
        this.state.ref.children[0].getComponentById('ai-input-file');

      uploader?.doAction({
        actionType: 'clear',
      });
    } else if (actionType === 'uploadClick') {
      this.handleUploadClick();
    }
  }

  @autobind
  handleUploadClick() {
    const uploadBtn: HTMLElement = document.querySelector('.input-file button');
    uploadBtn.click();
  }

  @autobind
  handleChange(context, doAction, event) {
    const { data, dispatchEvent } = this.props;

    this.setState(
      {
        files: event.data.files,
      },
      () =>
        dispatchEvent(
          'change',
          createObject(data, {
            value: event.data.files,
          })
        )
    );
  }

  @autobind
  async handleOpenTips() {
    const { dispatchEvent, data } = this.props;

    const rendererEvent = await dispatchEvent(
      'openTips',
      createObject(data, {
        value: true,
      }),
      this
    );

    if (rendererEvent?.prevented) {
      return;
    }
  }

  render() {
    let {
      classnames: cx,
      className,
      data,
      maxSize = 0,
      maxLength = 0,
      isMobile = false,
      env,
      enableMultimodal,
    } = this.props;
    const { fileLength } = this.state;

    return (
      <div className={cx('file-upload', 'file-upload', className)}>
        {isMobile ? null : (
          <div className="btn-area" style={{ gap: 15 }}>
            {enableMultimodal ? (
              <TooltipWrapperComp
                tooltip={{
                  content:
                    maxLength > 0 && maxLength === fileLength
                      ? `最多上传 ${maxLength} 个文件`
                      : '上传文档/图片',
                  trigger: 'hover',
                  tooltipTheme: 'dark',
                }}
              >
                <img
                  style={{
                    cursor:
                      maxLength > 0 && maxLength === fileLength
                        ? 'not-allowed'
                        : 'pointer',
                    height: 20,
                    width: 20,
                  }}
                  src={data.CONTEXT_ROOT + '/ai/icons/file-upload.png'}
                  alt=""
                  className="file-upload-btn"
                  onClick={this.handleUploadClick}
                />
              </TooltipWrapperComp>
            ) : null}
            <TooltipWrapperComp
              tooltip={{
                content: '提示词',
                trigger: 'hover',
                tooltipTheme: 'dark',
              }}
            >
              <div
                style={{
                  backgroundColor: '#F3F3F3',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                }}
                onClick={this.handleOpenTips}
              >
                <img
                  style={{
                    width: 10,
                  }}
                  src={data.CONTEXT_ROOT + '/ai/icons/ai-black.svg'}
                  alt=""
                />
                <span style={{ fontSize: 12 }}>提示词</span>
              </div>
            </TooltipWrapperComp>
          </div>
        )}
        <div className="file-area">
          {render(
            {
              type: 'form',
              // debug: true,
              data: {
                files: [],
              },
              className: `upload-form ${isMobile ? 'mobile' : ''}`,
              wrapWithPanel: false,
              body: [
                {
                  type: 'ai-input-file',
                  className: 'input-file',
                  id: 'ai-input-file',
                  name: 'files',
                  accept:
                    '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.svg,.txt,.md,.mdx',
                  multiple: true,
                  joinValues: false,
                  useChunk: false,
                  maxSize: maxSize,
                  maxLength: maxLength,
                  receiver: '/fs/api/attachment/upload',
                  onEvent: {
                    change: {
                      actions: [
                        {
                          actionType: 'custom',
                          script: (context, doAction, event) => {
                            this.setState({
                              fileLength: event.data.files.length,
                            });
                          },
                        },
                      ],
                    },
                  },
                },
              ],
              onEvent: {
                change: {
                  actions: [
                    {
                      actionType: 'custom',
                      script: this.handleChange,
                    },
                  ],
                },
              },
            },
            {
              scopeRef: (ref: any) => {
                if (ref) {
                  this.setState({
                    ref,
                  });
                }
              },
            }
          )}
        </div>
      </div>
    );
  }
}
