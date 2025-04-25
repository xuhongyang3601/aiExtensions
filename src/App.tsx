import React from 'react';
import { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import "./renderer"
import Router from './router';
const App: React.FC = () => {
  return (
    <HashRouter>
      <Router></Router>
    </HashRouter>
  );
};

export default App;
