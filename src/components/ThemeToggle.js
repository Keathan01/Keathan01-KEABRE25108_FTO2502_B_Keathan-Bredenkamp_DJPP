// src/components/ThemeToggle.js
import { useState, useEffect } from "react";
import darkIcon from "../assets/emojis.com light-bulb-off.png";
import lightIcon from "../assets/download.jpg";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <img
        src={theme === "dark" ? darkIcon : lightIcon}
        alt={theme === "dark" ? "Dark mode" : "Light mode"}
        className="w-5 h-5"
      />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
