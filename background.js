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
          world: "MAIN"
        })
        .then(() => {
          // 注入完数据后再执行script.js
          return chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["script.js"],
            world: "MAIN"
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
  }
});
