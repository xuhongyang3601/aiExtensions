import React from 'react';
import {
  FormItem,
  FormControlProps,
  resolveEventData,
  autobind,
  isPureVariable,
  resolveVariableAndFilter,
  filter,
} from 'amis-core';
// import { Textarea } from 'amis-ui';
import { Textarea } from './TextareaUi';
import type { ListenerAction } from 'amis-core';
import type { BaseSchema, FormBaseControl } from 'amis';

/**
 * TextArea 多行文本输入框。
 * 文档：https://aisuda.bce.baidu.com/amis/zh-CN/components/form/textarea
 */
export interface TextareaControlSchema extends FormBaseControl {
  type: 'ai-input';

  /**
   * 最大行数
   */
  maxRows?: number;

  /**
   * 最小行数
   */
  minRows?: number;

  /**
   * 是否只读
   */
  readOnly?: boolean;

  /**
   * 边框模式，全边框，还是半边框，或者没边框。
   */
  borderMode?: 'full' | 'half' | 'none';

  /**
   * 限制文字个数
   */
  maxLength?: number;

  /**
   * 是否显示计数
   */
  showCounter?: boolean;

  /**
   * 输入内容是否可清除
   */
  clearable?: boolean;

  /**
   * 重置值
   */
  resetValue?: string;
}

export type TextAreaRendererEvent = 'blur' | 'focus' | 'change';

// export interface TextAreaProps extends FormControlProps {
//   placeholder?: string;
//   minRows?: number;
//   maxRows?: number;
//   clearable?: boolean;
//   resetValue?: string;
// }

export interface TextAreaState {
  focused: boolean;
}

export interface TextAreaProps
  extends FormControlProps, Omit<TextareaControlSchema, 'type' | 'inputClassName' | 'descriptionClassName' | 'className'> {
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  clearable?: boolean;
  resetValue?: string;
}

export default class TextAreaControl extends React.Component<
  TextAreaProps,
  TextAreaState
> {
  static defaultProps: Partial<TextAreaProps> = {
    minRows: 3,
    maxRows: 20,
    trimContents: true,
    resetValue: '',
    clearable: false
  };

  inputRef = React.createRef<any>();

  doAction(action: ListenerAction, args: any) {
    const actionType = action?.actionType as string;
    const onChange = this.props.onChange;

    if (!!~['clear', 'reset'].indexOf(actionType)) {
      onChange?.(this.props.resetValue);
      this.focus();
    } else if (actionType === 'focus') {
      this.focus();
    }
  }

  focus() {
    this.inputRef.current?.focus();
  }

  @autobind
  handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { onChange, dispatchEvent } = this.props;

    dispatchEvent('change', resolveEventData(this.props, { value: e }));

    dispatchEvent('agentsShow', String(e).endsWith('@'));

    onChange && onChange(e);
  }

  @autobind
  handleEnter(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { dispatchEvent } = this.props;
    dispatchEvent('enter', resolveEventData(this.props, { value: e }));
  }

  @autobind
  handleFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
    const { onFocus, dispatchEvent, value } = this.props;

    this.setState(
      {
        focused: true
      },
      async () => {
        const rendererEvent = await dispatchEvent(
          'focus',
          resolveEventData(this.props, { value })
        );

        if (rendererEvent?.prevented) {
          return;
        }
        onFocus && onFocus(e);
      }
    );
  }

  @autobind
  handleBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    const { onBlur, trimContents, value, onChange, dispatchEvent } = this.props;

    this.setState(
      {
        focused: false
      },
      async () => {
        if (trimContents && value && typeof value === 'string') {
          onChange(value.trim());
        }

        const rendererEvent = await dispatchEvent(
          'blur',
          resolveEventData(this.props, { value })
        );

        if (rendererEvent?.prevented) {
          return;
        }

        onBlur && onBlur(e);
      }
    );
  }

  renderStatic(displayValue = '-') {
    const { render, staticSchema = {} } = this.props;

    return render(
      'static-textarea',
      {
        type: 'multiline-text',
        maxRows: staticSchema.limit || 5,
        ...staticSchema
      },
      {
        value: displayValue
      }
    );
  }

  render() {
    let { maxLength, showCounter, data, placeholder, ...rest } = this.props;

    if (isPureVariable(maxLength)) {
      maxLength = Number(resolveVariableAndFilter(maxLength, data) || 0);
    }
    if (isPureVariable(showCounter)) {
      showCounter = resolveVariableAndFilter(showCounter, data);
    }
    placeholder = filter(placeholder, data);

    return (
      <Textarea
        {...rest}
        maxLength={maxLength || undefined}
        showCounter={showCounter}
        placeholder={placeholder}
        forwardRef={this.inputRef}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onEnter={this.handleEnter}
      />
    );
  }
}

@FormItem({
  type: 'ai-input'
})
export class TextAreaControlRenderer extends TextAreaControl { }
