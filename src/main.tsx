import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";

type AmplifyOutputs = Record<string, unknown>;

const availableConfigs = import.meta.glob("../amplify_outputs.json", {
  eager: true,
  import: "default",
}) as Record<string, AmplifyOutputs>;

let resolvedConfig: AmplifyOutputs | undefined = Object.values(availableConfigs)[0];

if (!resolvedConfig) {
  const rawConfig = import.meta.env.VITE_AMPLIFY_CONFIG;
  if (rawConfig) {
    try {
      resolvedConfig = JSON.parse(rawConfig) as AmplifyOutputs;
    } catch (error) {
      console.error("Failed to parse VITE_AMPLIFY_CONFIG", error);
    }
  }
}

if (resolvedConfig) {
  Amplify.configure(resolvedConfig);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
