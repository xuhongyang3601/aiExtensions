import React from "react";
import { useState, useEffect } from "react";
import { HashRouter } from "react-router-dom";
import "./renderer";
import "./AmisActions";
import Router from "./router";
import { defaultBaseUrl } from "./constants";
import { getChromeStore, setGlobal } from "./utils/store";
const App: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string>("");
  useEffect(() => {
    getChromeStore("baseUrl").then((res) => {
      setBaseUrl(res || defaultBaseUrl);
      setGlobal("baseUrl", res || defaultBaseUrl);
    });
  }, []);
  if (!baseUrl) return <></>;
  return (
    <HashRouter>
      <Router></Router>
    </HashRouter>
  );
};

export default App;
