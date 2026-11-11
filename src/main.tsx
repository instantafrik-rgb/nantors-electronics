// Fonts self-hosted via Fontsource — LATIN UNIQUEMENT (pas de vietnamien, grec, etc.)
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/outfit/latin-800.css";

import "@fontsource/plus-jakarta-sans/latin-300.css";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";

import "@fontsource/syne/latin-600.css";
import "@fontsource/syne/latin-700.css";
import "@fontsource/syne/latin-800.css";

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
