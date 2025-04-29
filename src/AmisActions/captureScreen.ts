import {
  ListenerAction,
  registerAction,
  RendererAction,
  ListenerContext,
  RendererEvent,
  createObject,
} from "amis-core";
import { captureVisibleTab } from "../utils/tool";

export interface CaptureScreenArgs {}
export interface CaptureScreenAction extends ListenerAction {
  action: "print";
  args: CaptureScreenArgs;
}

export class CaptureScreenActionClass implements RendererAction {
  async run(
    action: CaptureScreenAction,
    renderer: ListenerContext,
    event: RendererEvent<any>
  ) {
    try {
      const { args } = action;
      const res = await captureVisibleTab();
      event.setData(createObject(event.data, { imgUrl: res }));
    } catch (error) {
      console.error(error);
    }
  }
}

registerAction("captureScreen", new CaptureScreenActionClass());
