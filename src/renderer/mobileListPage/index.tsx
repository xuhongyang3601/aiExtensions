import React from "react";
import cx from "classnames";
import { autobind, Renderer, RendererProps } from "amis";
import {
  evalExpression,
  evalJS,
  ScopedContext,
  isPureVariable,
  resolveVariableAndFilter,
  createObject,
  isObject,
  getPropValue,
  filter
} from "amis-core";
import type { IScopedContext, Api } from "amis-core";
import { Spinner } from "amis-ui";

export interface MobileListPageSchema {
  type: "mobile-list-page";
  api?: any;
  perPage?: number;
  lists: Array<any>;
}

export interface MobileListPageProps
  extends RendererProps,
    Omit<MobileListPageSchema, "type"> {}

interface MobileListPageState {
  showSpinner: boolean;
  page: number;
  lists: Array<any>;
  total: number;
  searchParams: object;
}
interface ListExtraProps extends RendererProps {
  list: any;
  item: any;
  index: number;
  itemKeyName: string;
  indexKeyName: string;
  name: string;
}
function EachItem(props: ListExtraProps) {
  const {
    render,
    data,
    list,
    item,
    name,
    index,
    itemKeyName,
    indexKeyName,
    onClick,
  } = props;
  const ctx = React.useMemo(
    () =>
      createObject(data, {
        ...(isObject(item) ? { index, ...item } : { [name]: item }),
        [itemKeyName || "item"]: item,
        [indexKeyName || "index"]: index,
      }),
    [item, data, name, index, itemKeyName, indexKeyName]
  );

  return (
    <div onClick={onClick} key={index}>
      {render(`item/${index}`, list, {
        data: ctx,
      })}
    </div>
  );
}
export class MobileListPage extends React.Component<MobileListPageProps> {
  static defaultProps: Partial<MobileListPageProps> = {
    api: "",
    perPage: 10,
  };

  private container: any;

  state: MobileListPageState = {
    showSpinner: false,
    page: 1,
    lists: [],
    total: 0,
    searchParams: {},
  };
  private loading = false;
  constructor(props: MobileListPageProps) {
    super(props);
    this.container = React.createRef();
    this.state.page = 1;
    const value = getPropValue(props, (props) =>
      props.source
        ? resolveVariableAndFilter(props.source, props.data, "| raw")
        : undefined
    );

    this.state.lists = isObject(value)
      ? Object.keys(value).map((key) => ({
          key: key,
          value: value[key],
        }))
      : Array.isArray(value)
      ? value
      : [];
  }
  componentDidUpdate(prevProps: Readonly<MobileListPageProps>): void {
      const props = this.props;
      const {api} = props;
      if (
        api.trackExpression &&
        filter(api.trackExpression, props.data) !==
          filter(prevProps.api.trackExpression, prevProps.data)
      ) {
        this.reload({},{});
      } 
  }
  componentDidMount(): void {
    this.fetchData(1);
    this.container.current.addEventListener("scroll", (event) => {
      const { scrollHeight, scrollTop, offsetHeight } = event.target;
      if (this.loading) return true;
      if (
        scrollHeight - (scrollTop + offsetHeight) < 5 &&
        this.state.total > this.state.lists.length
      ) {
        // 5是一个阈值，用于准确判断

        const page = this.state.page + 1;
        this.loading = true;
        this.setState({
          page,
        });
        this.fetchData(page);
        // 在这里执行到达底部后的操作
      }
    });
  }
  componentWillUnmount(): void {
    this.container.current.removeEventListener("scroll", null);
  }

  reload(param?: any, action?: any) {
    console.log("参数", action.params);
    const params = action.params;
    const {showSpinner} = this.state;
    if (showSpinner) {
      let timeout = setTimeout(() => {
        if (this.state.showSpinner){
          this.reload(param, action);
        } else {
          this.reloadApi(params);
        }
        clearTimeout(timeout);
      }, 20);
    } else {
      this.reloadApi(params);
    }
   
  }
  reloadApi(params?: any){
    this.setState(
      {
        showSpinner: false,
        page: 1,
        lists: [],
        total: 0,
        searchParams: {},
      },
      () => {
        this.fetchData(1, params);
      }
    );
  }

  async onClickItem(item: any) {
    const { dispatchEvent, data } = this.props;
    const rendererEvent = await dispatchEvent(
      "clickItem",
      createObject(data, {
        ...item,
      }),
      this
    );

    if (rendererEvent?.prevented) {
      return;
    }
  }

  tip(msg: string) {
    const { env } = this.props;
    env.alert(msg, "提示");
  }
  getRequestData(apiData: object, mergeData: object) {
    for (const key of Object.keys(apiData)) {
      if (
        apiData[key] &&
        typeof apiData[key] === "string" &&
        apiData[key].includes("$")
      ) {
        apiData[key] = evalJS(apiData[key], mergeData);
      } else if (
        apiData[key] === null ||
        apiData[key] === "" ||
        apiData[key] === " " ||
        JSON.stringify(apiData[key]) === "{}" ||
        JSON.stringify(apiData[key]) === "[]"
      ) {
        delete apiData[key];
      } else if (typeof apiData[key] === "object" && apiData[key] !== null) {
        apiData[key] = this.getRequestData(apiData[key], mergeData);
      }
    }
    return apiData;
  }
  @autobind
  async fetchData(page?: number, params: any = {}) {
    const { env, api, perPage } = this.props;
    if (!api) return;
   
    // 执行阻碍
    const mergeData = {
      ...this.props.store.data,
      ...this.props.data,
      ...params,
    };
    console.log("====== mergeData ==== :", mergeData);
    
    if (api.sendOn && !evalExpression(api.sendOn, mergeData)) {
      return;
    }
    this.setState({
      showSpinner: true,
    });
    let apiData = this.getRequestData({ ...api.data, ...mergeData }, mergeData);

    console.log("resolveVariableAndFilter apiData:", apiData);

    try {
      const requestApi: Api =
        typeof api == "object"
          ? {
              url: api.url,
              method: api.method || "get",
              data: {
                page: page,
                perPage: perPage,
                ...(apiData || {}),
              }
            }
          : {
              url: api,
              method: "get",
              data: {
                page: page,
                perPage: perPage,
                ...params,
              },
            };
      const result = await env.fetcher(requestApi);
      const { status, data, msg } = result;
      if (status == "0") {
        this.setState({
          lists: [...this.state.lists, ...data.records],
          total: data.total,
        });
      } else {
        this.tip(msg);
      }
    } catch (error) {
    } finally {
      this.setState({
        showSpinner: false,
      });
      this.loading = false;
    }
  }
  @autobind
  refContainer(container: HTMLDivElement) {
    this.container = container;
  }
  listContainerRender() {
    const { list, style, name, data, itemKeyName, indexKeyName } = this.props;
    const { showSpinner, lists, total } = this.state;
    return (
      <div
        className={cx("MobileListPage", "overflow-y-auto")}
        style={style || {}}
        ref={this.container}
      >
        <Spinner overlay key="info" show={showSpinner}></Spinner>
        {lists.map((item, index) => {
          return (
            <EachItem
              {...this.props}
              list={list}
              key={index}
              index={index}
              data={data}
              item={item}
              name={name}
              itemKeyName={itemKeyName}
              indexKeyName={indexKeyName}
              onClick={this.onClickItem.bind(this, item)}
            />
          );
        })}

        {!showSpinner &&
          (lists.length == 0 ? (
            <div className="h-full flex flex-col justify-center items-center">
              <img
                src={require("../../static/image/noData.png")}
                style={{ width: "198px" }}
              />
              <div
                style={{
                  color: "var(--colors-neutral-text-8)",
                  fontSize: "var(--fonts-size-6)",
                }}
              >
                暂无数据~
              </div>
            </div>
          ) : (
            <div
              className="text-center pt-4"
              style={{
                color: "var(--colors-neutral-text-4)",
                fontSize: "var(--fonts-size-7)",
              }}
            >
              {total > lists.length ? "加载更多" : "没有更多了"}
            </div>
          ))}
      </div>
    );
  }
  render() {
    return <>{this.listContainerRender()}</>;
  }
}

@Renderer({
  type: "mobile-list-page",
})
export class AmisEditorRenderer extends MobileListPage {
  static contextType = ScopedContext;

  constructor(props: MobileListPageProps, context: IScopedContext) {
    super(props);
    const scoped = context;
    scoped.registerComponent(this);
  }

  componentWillUnmount() {
    const scoped = this.context as IScopedContext;
    scoped.unRegisterComponent(this);
  }
}
