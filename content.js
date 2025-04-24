// 等待元素出现
function waitForElement(
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
}
// 表单自动填充类
class FormAutoFiller {
  constructor(formConfig) {
    this.formConfig = formConfig;
  }

  // 检查URL或Hash是否包含指定参数
  hasUrlParameter(paramName, paramValue) {
    // 检查普通URL参数
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get(paramName) === paramValue) {
      return true;
    }

    // 检查Hash参数
    const hash = window.location.hash;
    if (!hash) return false;

    const questionMarkIndex = hash.indexOf("?");
    if (questionMarkIndex !== -1) {
      const hashQueryString = hash.substring(questionMarkIndex + 1);
      const hashParams = new URLSearchParams(hashQueryString);
      if (hashParams.get(paramName) === paramValue) {
        return true;
      }
    }

    try {
      let paramString = hash.substring(1);
      if (paramString.includes("/") && paramString.includes("&")) {
        paramString = paramString.substring(paramString.indexOf("&"));
      }
      if (paramString.includes("=")) {
        const hashParams = new URLSearchParams(paramString);
        return hashParams.get(paramName) === paramValue;
      }
    } catch (e) {
      console.error("解析Hash参数出错:", e);
    }

    return false;
  }

  // DOM更新等待函数
  waitForDomUpdate(ms = 50) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, ms));
    });
  }

  // 触发输入事件
  triggerInputEvents(input, value) {
    input.value = value;

    ["input", "change"].forEach((eventType) => {
      input.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    ["keydown", "keyup"].forEach((eventType) => {
      input.dispatchEvent(new KeyboardEvent(eventType, { bubbles: true }));
    });
  }

  // 处理文本输入
  async handleTextElement(element, key) {
    const input = element.querySelector("input");
    if (!input) return;

    const value = this.formConfig[key].value;
    this.triggerInputEvents(input, value);
    console.log(`已为 ${this.formConfig[key].label} 设置值: ${value}`);
  }

  // 处理下拉选择
  async handleSelectElement(element, key) {
    const select = element.querySelector(".cxd-Select");
    if (!select) return;

    select.click();
    const popover = await waitForElement(".cxd-PopOver", element);

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
  }

  // 处理日期选择
  async handleDateElement(element, key) {
    const datePicker = element.querySelector(".cxd-DatePicker", element);
    if (!datePicker) return;

    const timestamp = this.formConfig[key].value;
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    datePicker.click();
    const popover = await waitForElement(".cxd-DatePicker-popover", element);
    await this.selectDate(popover, year, month, day);
    console.log(
      `已为 ${this.formConfig[key].label} 设置日期: ${year}-${month}-${day}`
    );
  }

  // 选择日期
  async selectDate(datePicker, targetYear, targetMonth, targetDay) {
    const rdtHeader = datePicker.querySelector(".rdtHeader");
    const dateElements = rdtHeader.querySelectorAll(".rdtSwitch");
    const prevButtons = rdtHeader.querySelectorAll(".rdtPrev");
    const nextButtons = rdtHeader.querySelectorAll(".rdtNext");

    const currentYear = parseInt(dateElements[0].innerText);
    const currentMonth = parseInt(dateElements[1].innerText);

    // 调整年份
    if (currentYear !== targetYear) {
      const button = currentYear > targetYear ? prevButtons[0] : nextButtons[0];
      button.click();
      await this.waitForDomUpdate();
      return this.selectDate(datePicker, targetYear, targetMonth, targetDay);
    }

    // 调整月份
    if (currentMonth !== targetMonth) {
      const button =
        currentMonth > targetMonth ? prevButtons[1] : nextButtons[1];
      button.click();
      await this.waitForDomUpdate();
      return this.selectDate(datePicker, targetYear, targetMonth, targetDay);
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
        return;
      }
    }

    throw new Error(`未找到日期: ${targetDay}`);
  }

  // 处理文件上传
  async handleFileElement(element, key) {
    const fileControl = element.querySelector(".cxd-FileControl");
    if (!fileControl) return;

    const files = this.formConfig[key].value;
    if (!files || !files.length) {
      console.log(`未上传文件: ${this.formConfig[key].label}`);
      return;
    }

    try {
      // 查找文件输入元素
      const fileInput = fileControl.querySelector('input[type="file"]');
      if (!fileInput) {
        throw new Error("未找到文件输入元素");
      }

      // 从后台接口获取文件
      const fileData = await this.fetchFile(files[0].value);
      if (!fileData) {
        throw new Error(`通过ID获取文件失败: ${this.formConfig[key].label}`);
      }

      const file = new File([fileData.content], fileData.fileName, {
        type: fileData.fileType,
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // 设置文件输入的 files 属性
      fileInput.files = dataTransfer.files;

      // 触发 change 事件
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(
        `已为 ${this.formConfig[key].label} 设置文件: ${fileData.fileName}`
      );
    } catch (error) {
      console.error(`文件上传处理失败:`, error);
      throw error;
    }
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
      };

      const handler = handlers[this.formConfig[key].inputType];
      if (!handler) {
        console.log(`不支持的输入类型: ${this.formConfig[key].inputType}`);
        return;
      }

      await handler(element, key);
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
      if (!this.hasUrlParameter("autoFillForm", "true")) {
        console.log("未启用自动填充表单功能");
        return;
      }
      await this.processAllFields();
    } catch (error) {
      console.error("表单处理失败:", error);
    }
  }
}

// 初始化并启动表单自动填充
window.addEventListener("load", async function () {
  // 表单配置数据
  await waitForElement(".cxd-Form");
  const formJson = {
    sqr: {
      value: "测试自动输入申请人",
      inputType: "text",
      element: document.querySelectorAll(".cxd-Form td")[1],
    },
    bm: {
      value: "测试自动输入部门",
      inputType: "text",
      element: document.querySelectorAll(".cxd-Form td")[3],
    },
    sbrq: {
      value: "1677600000",
      inputType: "date",
      element: document.querySelectorAll(".cxd-Form td")[5],
    },
    xjhyh: {
      value: "个人和对公",
      inputType: "select",
      element: document.querySelectorAll(".cxd-Form td")[9],
    },
    fj: {
      value: [
        {
          attId: "9e16ada70ed34885b10a592869ded3b7",
          name: "03 迈越AI智能写作平台-需求说明书-V1.0.2.docx",
          id: "4888dfbc86f2",
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileSize: 2186332,
          state: "uploaded",
          url: "/fs/api/attachment/download/9e16ada70ed34885b10a592869ded3b7.docx",
          filename: "03 迈越AI智能写作平台-需求说明书-V1.0.2.docx",
          fileExt: "docx",
          preview: true,
          previewPath:
            "/fs/api/attachment/preview/9e16ada70ed34885b10a592869ded3b7.pdf",
          value:
            "/fs/api/attachment/download/9e16ada70ed34885b10a592869ded3b7.docx",
        },
      ],
      inputType: "file",
      element: document.querySelectorAll(".cxd-Form td")[15],
    },
  };
  const formFiller = new FormAutoFiller(formJson);
  console.log("表单已加载，开始填充");

  formFiller.init();
});
