// @ts-nocheck
import React from "react";
import {
  autobind,
  isEffectiveApi,
  Renderer,
  RendererProps,
  ScopedContext,
  ServiceStore,
} from "amis-core";
import type { IScopedContext } from "amis-core";
import { SchemaApi, render } from "amis";
import { Tabs, Tab } from "amis-ui";

export interface MobileTabsListProps extends RendererProps {
  //
  api: any;
  tabsApi: SchemaApi;
  search?: boolean;
}

interface MobileTabsListState {
  tabs: any[];
  activeKey: string;
}

class MobileTabsList extends React.Component<
  MobileTabsListProps,
  MobileTabsListState
> {
  constructor(props: MobileTabsListProps) {
    super(props);
    this.state = {
      tabs: [],
      activeKey: undefined,
    };
  }

  componentDidUpdate(prevProps: Readonly<MobileTabsListProps>): void {
    const { tabsApi, env } = this.props;

    if (tabsApi !== prevProps.tabsApi) {
      env
        .fetcher(tabsApi)
        .then(this.renderList)
        .catch(() => {
          //
        });
    }
  }

  componentDidMount(): void {
    this.getTabsList();
  }

  @autobind
  getTabsList() {
    const { tabsApi, env } = this.props;

    if (tabsApi && isEffectiveApi(tabsApi)) {
      //  fetcher已经兼容了string 和 object方式
      env
        .fetcher(tabsApi)
        .then(this.renderList)
        .catch(() => {
          //
        });
    }
  }

  @autobind
  reload() {
    this.getTabsList();
  }
  @autobind
  renderList(res) {
    if (!res || !res.ok) {
      return;
    }

    const data = res?.data;

    if (!data) {
      return;
    }

    this.setState({ tabs: data, activeKey: data[0]?.value });
  }

  @autobind
  tabsChangeSelect(type) {
    this.setState({ activeKey: type }, () => {});
  }

  componentWillUnmount(): void {
    //
  }

  render() {
    const { tabs } = this.state;
    const { api, itemKey, search = false, tabListStyle= {} } = this.props;
    return (
      <div
        style={{
          width: "100%",
        }}
        id="mobile-tabs"
      >
        <Tabs
          activeKey={this.state.activeKey}
          tabsMode="line"
          onSelect={this.tabsChangeSelect}
          swipeable={true}
        >
          {tabs.map((item) => {
            const nodeData = tabs.find(
              (node) => node.value === this.state.activeKey
            );

            const apiRe = {
              ...api as Object,
              data: {
                ...api?.data,
                [itemKey]:
                  itemKey !== "fileType"
                    ? nodeData
                    : {
                        id: nodeData.value,
                        name: nodeData.label,
                      },
              },
            };

            if (search) {
              apiRe.data.name = "${name}";
            }

            return (
              <Tab
                key={item.value}
                eventKey={item.value}
                title={item.label}
                unmountOnExit={true}
              >
                {render({
                  type: "page",
                  className: "p-0",
                  bodyClassName: "p-0",
                  body: [
                    search && {
                      type: "input-text",
                      name: "title",
                      label: "",
                      inputControlClassName: "tongban-mobile-radius-input",
                      clearable: true,
                      style: {
                        padding: "15px",
                      },
                      placeholder: "搜索关键字",
                      onEvent: {
                        change: {
                          actions: [
                            {
                              actionType: "reload",
                              componentId: "tabs-list",
                              args: {
                                params: {
                                  name: "${event.data.value}",
                                },
                              },
                            },
                          ],
                        },
                        clear: {
                          actions: [
                            {
                              actionType: "reload",
                              componentId: "tabs-list",
                              args: {
                                params: {
                                  name: "",
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      type: "mobile-list-page",
                      id: "tabs-list",
                      api: apiRe,
                      style: {
                        padding: "12px 15px",
                        background: "#F5F5F5",
                        ...tabListStyle
                      },
                      list: {
                        type: "service",
                        className: "p-0",
                        body: [
                          {
                            type: "wrapper",
                            style: {
                              padding: "14px",
                              background: "#FFFFFF",
                              "border-radius": 10,
                              "margin-bottom": "12px",
                            },
                            body: [
                              {
                                type: "tpl",
                                tpl: "${name}",
                                style: {
                                  fontWeight: 600,
                                  fontSize: "var(--fonts-size-6)",
                                  color: "var(--colors-neutral-text-4)",
                                  cursor: "pointer",
                                  display: "block",
                                  width: "100%",
                                },
                                className: "webKitBoxClamp2",
                              },
                              {
                                type: "wrapper",
                                style: {
                                  margin: "14px 0",
                                  padding: 0,
                                  height: 1,
                                  border: "1px solid var(--colors-neutral-line-10)",
                                },
                              },
                              {
                                type: "wrapper",
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  fontWeight: 400,
                                  fontSize: "13px",
                                  color: "var(--colors-neutral-text-8)",
                                  cursor: "pointer",
                                  padding: 0,
                                  gap: 8,
                                  "margin-top": 8,
                                },
                                body: [
                                  {
                                    type: "tpl",
                                    tpl:
                                      itemKey !== "fileType"
                                        ? "${publishTime}"
                                        : "${createTime}",
                                  },
                                  {
                                    type: "tpl",
                                    tpl: "已读",
                                    visibleOn: "${read === true}",
                                  },
                                  {
                                    type: "tpl",
                                    tpl: "未读",
                                    className: "text-primary",
                                    visibleOn: "${read === false}",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      onEvent: {
                        clickItem: {
                          actions: [
                            itemKey !== "fileType"
                              ? {
                                  actionType: "link",
                                  args: {
                                    link: "/platform/page/mobile/notice/detail",
                                    params: {
                                      id: "${event.data.id}",
                                      pageTitle: "通知公告详情",
                                      hideFooter: true,
                                      read: false,
                                    },
                                  },
                                }
                              : {
                                  actionType: "link",
                                  args: {
                                    link: "/platform/page/mobile/policy/detail",
                                    params: {
                                      id: "${event.data.id}",
                                      pageTitle: "政策文件详情",
                                      hideFooter: true,
                                      read: false,
                                    },
                                  },
                                },
                          ],
                        },
                      },
                    },
                  ],
                })}
              </Tab>
            );
          })}
        </Tabs>
      </div>
    );
  }
}

@Renderer({
  type: "mobile-tabs-list",
  storeType: ServiceStore.name,
})
export default class MobileTabsListRenderer extends MobileTabsList {
  static contextType = ScopedContext;

  constructor(props: MobileTabsListProps, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);
    super.componentWillUnmount();
  }
}
