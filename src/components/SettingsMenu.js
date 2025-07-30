import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);

  const handleResetHistory = () => {
    localStorage.removeItem("listeningProgress");
    alert("Listening history has been reset.");
  };

  return (
    <div className="relative">
      {/* Settings toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm"
        title="Settings"
      >
        ⚙️
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 p-4 rounded shadow-lg z-50">
          <h3 className="font-semibold mb-2 text-lg">Settings</h3>
          <ThemeToggle />
          <button
            onClick={handleResetHistory}
            className="mt-3 w-full bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 text-sm"
          >
            Reset Listening History
          </button>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 w-full bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-1 px-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
          >
            Close Settings
          </button>
        </div>
      )}
    </div>
  );
}
