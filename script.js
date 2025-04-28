// 等待元素出现
window.waitForElement = function (
  selector,
  rootElement = document,
  timeout = 10000,
  checkFrequency = 100
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    function check() {
      const element = rootElement.querySelector(selector);
      if (element) {
        return resolve(element);
      }
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) {
        return reject(new Error(`等待元素 ${selector} 超时`));
      }
      setTimeout(check, checkFrequency);
    }
    check();
  });
};
// 处理表单配置数据
window.processFormConfig = function (data, config) {
  data.inputType = config.inputType;
  data.element = config.element;
};
// 获取地址栏参数
function getUrlParameter(paramName) {
  // 检查普通URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const searchValue = urlParams.get(paramName);
  if (searchValue) {
    return searchValue;
  }

  // 检查Hash参数
  const hash = window.location.hash;
  if (!hash) return null;

  // 检查问号后的参数
  const questionMarkIndex = hash.indexOf("?");
  if (questionMarkIndex !== -1) {
    const hashQueryString = hash.substring(questionMarkIndex + 1);
    const hashParams = new URLSearchParams(hashQueryString);
    const hashValue = hashParams.get(paramName);
    if (hashValue) {
      return hashValue;
    }
  }

  try {
    // 检查hash中的其他格式参数
    let paramString = hash.substring(1);
    if (paramString.includes("/") && paramString.includes("&")) {
      paramString = paramString.substring(paramString.indexOf("&"));
    }
    if (paramString.includes("=")) {
      const hashParams = new URLSearchParams(paramString);
      const value = hashParams.get(paramName);
      if (value) {
        return value;
      }
    }
  } catch (e) {
    console.error("解析Hash参数出错:", e);
  }

  return null;
}
// 根据表单id获取表单配置
async function getFormConfigById(formId) {
  try {
    // 发送请求获取文件流
    const response = await fetch(
      `http://172.18.0.66/dianda/ai/public/appLink/extract/params/${formId}`
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const formConfig = await response.json();
    let params = formConfig.data.params;
    let script = formConfig.data.script;
    for (let key in params) {
      params[key] = {
        value: params[key],
      };
    }
    return {
      params,
      script,
    };
  } catch (error) {
    console.error("获取表单配置:", error);
    return null;
  }
}
// 表单自动填充类
class FormAutoFiller {
  constructor(formConfig) {
    this.formConfig = formConfig;
  }

  // DOM更新等待函数
  waitForDomUpdate(ms = 50) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, ms));
    });
  }
  // 处理日期格式
  formatDate(dateValue) {
    if (typeof dateValue === "number" || !isNaN(dateValue)) {
      // 处理时间戳（支持字符串形式的数字）
      dateValue = new Date(Number(dateValue) * 1000);
    } else if (typeof dateValue === "string") {
      // 处理日期字符串，如 "2021-05-05"
      dateValue = new Date(dateValue);
    } else {
      dateValue = null;
    }

    // 确保日期有效
    if (isNaN(dateValue.getTime())) {
      dateValue = null;
    }
    return dateValue;
  }

  // 处理单个字段
  async processField(key) {
    try {
      const element = this.formConfig[key].element;
      if (!element) {
        return;
      }

      const handlers = {
        text: this.handleTextElement.bind(this),
        select: this.handleSelectElement.bind(this),
        date: this.handleDateElement.bind(this),
        file: this.handleFileElement.bind(this),
        dateTime: this.handleDateTimeElement.bind(this),
      };

      const handler = handlers[this.formConfig[key].inputType];
      if (!handler) {
        console.log(`不支持的输入类型: ${this.formConfig[key].inputType}`);
        return;
      }

      await handler(element, key);
      await this.waitForDomUpdate(500);
    } catch (error) {
      console.error(`处理字段时出错:`, error);
    }
  }

  // 顺序处理所有字段
  async processAllFields() {
    const fields = Object.keys(this.formConfig);

    for (const key of fields) {
      await this.processField(key);
    }

    console.log("所有字段处理完成");
  }

  // 初始化并开始填充表单
  async init() {
    try {
      await this.processAllFields();
    } catch (error) {
      console.error("表单处理失败:", error);
    }
  }
}
class AmisAutoFiller extends FormAutoFiller {
  constructor(formConfig) {
    super(formConfig);
  }
  // 触发输入事件
  triggerInputEvents(input, value) {
    // 设置value属性
    input.value = value;
    input.setAttribute("value", value);

    // 创建原生事件
    const nativeInputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      composed: true,
      data: value,
      inputType: "insertText",
    });

    // 创建React 18的合成事件对象
    const createReactEvent = (nativeEvent) => ({
      _reactName: "onChange",
      _targetInst: null,
      type: "change",
      nativeEvent: nativeEvent,
      target: input,
      currentTarget: input,
      eventPhase: 2,
      bubbles: true,
      cancelable: true,
      timeStamp: Date.now(),
      defaultPrevented: false,
      isTrusted: true,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    // 获取React Fiber节点
    const fiberKey = Object.keys(input).find((key) =>
      key.startsWith("__reactProps$")
    );
    if (fiberKey) {
      const props = input[fiberKey];
      if (props.onChange) {
        // 触发React的onChange事件
        props.onChange(createReactEvent(nativeInputEvent));
      }
    }

    // 触发原生事件
    input.dispatchEvent(nativeInputEvent);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  // 处理文本输入
  handleTextElement(element, key) {
    return new Promise((resolve, reject) => {
      try {
        const input = element.querySelector("input");
        if (!input) return;

        const value = this.formConfig[key].value;
        this.triggerInputEvents(input, value);
        console.log(`已为 ${this.formConfig[key].label} 设置值: ${value}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理下拉选择
  handleSelectElement(element, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const select = element.querySelector(".cxd-Select");
        if (!select) return resolve();

        select.click();
        const popover = await waitForElement(".cxd-Select-menu");

        const options = popover.querySelectorAll(".cxd-Select-option");
        const targetValue = this.formConfig[key].value;

        let optionFound = false;
        for (const option of options) {
          if (option.innerText === targetValue) {
            option.click();
            optionFound = true;
            break;
          }
        }

        if (!optionFound) {
          throw new Error(`未找到选项: ${targetValue}`);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理日期选择
  handleDateElement(element, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const datePicker = element.querySelector(".cxd-DatePicker", element);
        if (!datePicker) return resolve();

        const date = this.formatDate(this.formConfig[key].value);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        datePicker.click();
        const popover = await waitForElement(".cxd-DatePicker-popover");
        await this.selectDate(popover, year, month, day);
        console.log(
          `已为 ${this.formConfig[key].label} 设置日期: ${year}-${month}-${day}`
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理日期时间选择
  handleDateTimeElement(element, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const datePicker = element.querySelector(".cxd-DatePicker", element);
        if (!datePicker) return resolve();

        const date = this.formatDate(this.formConfig[key].value);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        // 获取小时
        const hour = date.getHours();
        // 获取分钟
        const minute = date.getMinutes();
        datePicker.click();
        const popover = await waitForElement(".cxd-DatePicker-popover");
        await this.selectDate(popover, year, month, day, hour, minute);
        // resolve();
        let actions = popover.querySelectorAll(
          ".cxd-DateRangePicker-actions>button"
        );
        actions[1].click();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 处理文件上传
  handleFileElement(element, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileControl = element.querySelector(".cxd-FileControl");
        if (!fileControl) return resolve();

        const files = this.formConfig[key].value;
        if (!files || !files.length) {
          console.log(`未上传文件: ${this.formConfig[key].label}`);
          return resolve();
        }

        // 查找文件输入元素
        const fileInput = fileControl.querySelector('input[type="file"]');
        if (!fileInput) {
          throw new Error("未找到文件输入元素");
        }

        // 检查文件控件是否为多选
        const isMultiple = fileInput.hasAttribute("multiple");
        const dataTransfer = new DataTransfer();

        if (isMultiple) {
          for (const fileInfo of files) {
            const fileData = await this.fetchFile(fileInfo.value);
            if (!fileData) {
              console.error(`通过ID获取文件失败: ${fileInfo.name}`);
              continue;
            }
            const file = new File([fileData.content], fileData.fileName, {
              type: fileData.fileType,
            });
            dataTransfer.items.add(file);
          }
        } else {
          const fileData = await this.fetchFile(files.value);
          if (fileData) {
            const file = new File([fileData.content], fileData.fileName, {
              type: fileData.fileType,
            });
            dataTransfer.items.add(file);
          } else {
            throw new Error(`通过ID获取文件失败: ${files.name}`);
          }
        }

        if (!dataTransfer.files || dataTransfer.files.length === 0) {
          throw new Error("没有成功获取任何文件");
        }

        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 选择日期
  async selectDate(
    datePicker,
    targetYear,
    targetMonth,
    targetDay,
    targetHour,
    targetMinute
  ) {
    const rdtHeader = datePicker.querySelector(".rdtHeader");
    const dateElements = rdtHeader.querySelectorAll(".rdtSwitch");
    const prevButtons = rdtHeader.querySelectorAll(".rdtPrev");
    const nextButtons = rdtHeader.querySelectorAll(".rdtNext");

    const currentYear = parseInt(dateElements[0].innerText);
    const currentMonth = parseInt(dateElements[1].innerText);
    // 调整年份
    if (currentYear != targetYear) {
      const button = currentYear > targetYear ? prevButtons[0] : nextButtons[1];
      button.click();
      await this.waitForDomUpdate();
      return this.selectDate(
        datePicker,
        targetYear,
        targetMonth,
        targetDay,
        targetHour,
        targetMinute
      );
    }

    // 调整月份
    if (currentMonth != targetMonth) {
      const button =
        currentMonth > targetMonth ? prevButtons[1] : nextButtons[0];
      button.click();
      await this.waitForDomUpdate();
      return this.selectDate(
        datePicker,
        targetYear,
        targetMonth,
        targetDay,
        targetHour,
        targetMinute
      );
    }

    // 选择日期
    const days = datePicker.querySelectorAll(".rdtDay");
    for (const day of days) {
      if (
        day.innerText == targetDay &&
        !day.classList.contains("rdtOld") &&
        !day.classList.contains("rdtNew")
      ) {
        day.click();
        await this.waitForDomUpdate();
        if (targetHour) {
          let sugsItems = datePicker.querySelectorAll(
            ".cxd-CalendarInput-sugsHours > .cxd-CalendarInput-sugsItem"
          );
          for (let item of sugsItems) {
            if (item.innerText == targetHour) {
              item.click();
              await this.waitForDomUpdate();
              break;
            }
          }
        }
        if (targetMinute) {
          let sugsItems = datePicker.querySelectorAll(
            ".cxd-CalendarInput-sugsTimes >.cxd-CalendarInput-sugsItem"
          );
          for (let item of sugsItems) {
            if (item.innerText == targetMinute) {
              await this.waitForDomUpdate();
              item.click();
              break;
            }
          }
        }
        return;
      }
    }
    await this.waitForDomUpdate();
    throw new Error(`未找到日期: ${targetDay}`);
  }

  // 通过文件ID从后台接口获取文件
  async fetchFile(downloadUrl) {
    try {
      // 发送请求获取文件流
      const response = await fetch("http://172.18.0.66/dianda" + downloadUrl);

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      // 获取文件名
      const contentDisposition = response.headers.get("content-disposition");
      let fileName = "";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, "");
          // 解码文件名
          try {
            fileName = decodeURIComponent(fileName);
          } catch (e) {}
        }
      }

      if (!fileName) {
        const urlParts = downloadUrl.split("/");
        fileName = urlParts[urlParts.length - 1];
      }

      // 获取内容类型
      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      const blob = await response.blob();

      console.log("文件获取成功:", fileName, contentType, blob.size + " 字节");

      return {
        fileName: fileName,
        fileType: contentType,
        content: blob, // 直接返回blob对象
      };
    } catch (error) {
      console.error("获取文件信息失败:", error);
      return null;
    }
  }
}
// 暴露 AmisAutoFiller 类
window.AmisAutoFiller = AmisAutoFiller;
// 初始化并启动表单自动填充
(async function () {
  try {
    let formId = getUrlParameter("__AUTOFIELL_FORM_ID__");
    if (!formId) {
      console.log("未启用自动填充表单功能");
      return;
    }
    let data = await getFormConfigById(formId);
    // 修改处理表单配置数据的函数字符串
    const processFormDataStr = `return ${data.script}`;

    // 创建函数
    const processFormData = new Function(processFormDataStr)();
    processFormData(data.params);
  } catch (error) {
    console.error(error);
  }
})();
