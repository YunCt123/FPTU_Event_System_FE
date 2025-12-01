import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainRoute from "./routes/MainRoute";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainRoute />
  </StrictMode>
);
