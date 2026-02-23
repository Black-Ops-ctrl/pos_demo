import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";
import AppRouter from "./core/routes/AppRouter";
import App from './App.tsx';
import './index.css';

// Use StrictMode and BrowserRouter for routing
createRoot(document.getElementById("root")!).render(
  <App/>
);
