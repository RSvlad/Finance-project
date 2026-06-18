import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@identity/application/AuthContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
