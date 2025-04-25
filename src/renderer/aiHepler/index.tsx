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
import Amis from "../../components/Amis";
import schema from '../../components/aiHelper/index'

import { Icon, TooltipWrapper } from 'amis-ui';
import debounce from "lodash/debounce";

export interface AiHelperSchema extends Omit<BaseSchema, 'type'> {
  type: 'ai-helper';
}

@Renderer({
  type: 'ai-helper',  // 修正拼写错误
  autoVar: true,
})
export class AiHelperMobileRenderer extends React.Component<
  Omit<AiHelperSchema, 'type'> & RendererProps
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

  componentDidUpdate(prevProps: Readonly<Omit<AiHelperSchema, 'type'> & RendererProps>): void {

  }

  /**
 * 动作处理
 */
  doAction(action: ActionObject, args: any) {

  }

  render() {
    return <Amis schema={schema}></Amis>
  }
}
