import React, { useState } from 'react';

function App() {
  const [logs, setLogs] = useState([]);

  const handleFillForm = () => {
    // 向当前活动标签页发送填充表单的消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm' });
        addLog('已发送填充表单指令');
      }
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, { message, timestamp: new Date().toLocaleTimeString() }]);
  };

  return (
    <div className="app-container">
      <h1>表单自动填充工具</h1>
      
      <div className="control-panel">
        <button onClick={handleFillForm} className="action-button">
          填充表单
        </button>
        <button onClick={handleClearLogs} className="action-button">
          清除日志123
        </button>
      </div>

      {logs.length > 0 && (
        <div className="logs-container">
          <h2>操作日志</h2>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;