import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { NotificationProvider } from "@web3uikit/core";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <NotificationProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </NotificationProvider>
);

