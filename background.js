// 设置侧栏在点击扩展图标时打开
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startFormAutoFill") {
    const tabId = sender.tab.id;
    // 使用 chrome.scripting.executeScript 在页面中执行脚本
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["script.js"],
        world: "MAIN", // 在主页面世界中执行
      })
      .then((results) => {
        sendResponse({ success: true, results });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.toString() });
      });

    return true; // 保持消息通道开放以进行异步响应
  }
});
