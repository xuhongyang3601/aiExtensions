// 设置侧栏在点击扩展图标时打开
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startFormAutoFill") {
    const tabId = sender.tab.id;

    // 先获取storage数据
    chrome.storage.sync.get(null, (storageData) => {
      // 使用 chrome.scripting.executeScript 注入数据和脚本
      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          func: (data) => {
            // 将storage数据注入到全局变量
            window.__storageData = data;
          },
          args: [storageData],
          world: "MAIN",
        })
        .then(() => {
          // 注入完数据后再执行script.js
          return chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["script.js"],
            world: "MAIN",
          });
        })
        .then((results) => {
          sendResponse({ success: true, results });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.toString() });
        });
    });

    return true; // 保持消息通道开放以进行异步响应
  } else if (message.action === "takeScreenshot") {
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || !tabs[0]) {
        sendResponse({ success: false, error: "未找到活动标签页" });
        return;
      }

      // 先注入获取页面尺寸的脚本
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            return {
              width: Math.max(
                document.documentElement.scrollWidth,
                document.body.scrollWidth
              ),
              height: Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight
              ),
              viewportWidth: window.innerWidth,
              viewportHeight: window.innerHeight,
              originalScroll: window.scrollY,
            };
          },
        })
        .then(async (results) => {
          const dimensions = results[0].result;

          // 修改页面缩放以适应完整宽度
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (dimensions) => {
              // 修改页面样式以确保完整捕获
              document.documentElement.style.setProperty(
                "height",
                `${dimensions.height}px`
              );
              document.documentElement.style.setProperty(
                "width",
                `${dimensions.width}px`
              );
              document.documentElement.style.setProperty("overflow", "hidden");
            },
            args: [dimensions],
          });

          // 执行截图
          const dataUrl = await chrome.tabs.captureVisibleTab(null, {
            format: "png",
          });

          // 恢复原始样式和滚动位置
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (scrollY) => {
              document.documentElement.style.removeProperty("height");
              document.documentElement.style.removeProperty("width");
              document.documentElement.style.removeProperty("overflow");
              window.scrollTo(0, scrollY);
            },
            args: [dimensions.originalScroll],
          });

          sendResponse({ success: true, dataUrl });
        })
        .catch((error) => {
          console.error("截图失败:", error);
          sendResponse({ success: false, error: error.toString() });
        });
    });
    return true;
  }
});
