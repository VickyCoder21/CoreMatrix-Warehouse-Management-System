import React from "react";
import ReactDOM from "react-dom/client";

import "@coreui/coreui/dist/css/coreui.min.css";
import "./scss/style.scss";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);