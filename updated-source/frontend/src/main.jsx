import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/design-system.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import rioIcon from "./assets/rio-logo.svg";

const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = rioIcon;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);
