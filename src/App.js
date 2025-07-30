// src/App.js

import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShowDetail from "./pages/ShowDetail";
import FavoritesPage from "./pages/FavoritesPage";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import SettingsMenu from "./components/SettingsMenu";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-black/90 text-black dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-800">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <img src="/Logo.png" alt="Logo" className="w-20 h-20" />
          Podcast App
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/favorites"
            className="hover:text-blue-500 dark:hover:text-blue-300"
            title="Favorites"
          >
            ❤️Favorites
          </Link>
          <SettingsMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/show/:showId" element={<ShowDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>

      {/* Audio Player */}
      <footer className="sticky bottom-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md">
        <GlobalAudioPlayer />
      </footer>
    </div>
  );
}
