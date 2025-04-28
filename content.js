// 初始化并启动表单自动填充
window.addEventListener("load", async function () {
  chrome.runtime.sendMessage(
    {
      action: "startFormAutoFill",
    },
    (response) => {
      console.log(response);
    }
  );
});
