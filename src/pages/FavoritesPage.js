import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const [episodes, setEpisodes] = useState([]);
  const [sortBy, setSortBy] = useState("az");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites")) || [];
    setEpisodes(stored);
  }, []);

  const getEpisodeId = (ep) =>
    ep.id ||
    ep.uuid ||
    `${ep.title}-${ep.seasonNumber || "?"}-${ep.episodeNumber || "?"}`;

  const removeFavorite = (id) => {
    const updated = episodes.filter((ep) => getEpisodeId(ep) !== id);
    setEpisodes(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const sorted = [...episodes].sort((a, b) => {
    if (sortBy === "az") return a.title.localeCompare(b.title);
    if (sortBy === "za") return b.title.localeCompare(a.title);
    if (sortBy === "newest") return b.addedAt - a.addedAt;
    if (sortBy === "oldest") return a.addedAt - b.addedAt;
    return 0;
  });

  const genres = Array.from(
    new Set(
      episodes.flatMap((ep) =>
        (ep.genres || []).map((g) =>
          typeof g === "number" ? genreIdToName[g] || `Genre ${g}` : g
        )
      )
    )
  );

  const filtered =
    selectedGenre === "All"
      ? sorted
      : sorted.filter((ep) =>
          (ep.genres || [])
            .map((g) =>
              typeof g === "number" ? genreIdToName[g] || `Genre ${g}` : g
            )
            .includes(selectedGenre)
        );

  const grouped = filtered.reduce((acc, ep) => {
    const key = ep.showTitle || "Unknown Show";
    acc[key] = acc[key] || [];
    acc[key].push(ep);
    return acc;
  }, {});

  const resetFilters = () => {
    setSortBy("az");
    setSelectedGenre("All");
  };

  if (!episodes.length) {
    return (
      <div className="p-6 text-gray-600">
        No favorite episodes found.{" "}
        <a href="/" className="text-blue-500 underline">
          Go back to the homepage
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        ← Go Back
      </button>

      <h1 className="text-2xl font-bold mb-4">❤️ Favorite Episodes</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="font-medium mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-4 py-2 rounded dark:text-black"
          >
            <option value="az">Title A–Z</option>
            <option value="za">Title Z–A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div>
          <label className="font-medium mr-2">All Genres:</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border px-4 py-2 rounded dark:text-black"
          >
            <option value="All">All</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Reset Filters
        </button>
      </div>

      {Object.entries(grouped).map(([showTitle, eps]) => (
        <div key={showTitle} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{showTitle}</h2>

          <p className="text-sm text-gray-500 mb-4">
            {new Set(eps.map((e) => e.seasonNumber)).size} season(s),{" "}
            {eps.length} episode(s)
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eps.map((ep) => {
              const id = getEpisodeId(ep);
              return (
                <div
                  key={id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow relative"
                >
                  <h3 className="font-bold text-lg mb-1">{ep.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Genre:{" "}
                    {(ep.genres || [])
                      .map((g) =>
                        typeof g === "number"
                          ? genreIdToName[g] || `Genre ${g}`
                          : g
                      )
                      .join(", ") || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Season {ep.seasonNumber || "?"}, Episode{" "}
                    {ep.episodeNumber || "?"}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    Added:{" "}
                    {ep.addedAt
                      ? new Date(ep.addedAt).toLocaleString()
                      : "Unknown"}
                  </p>

                  {ep.audio ? (
                    <audio controls className="w-full mt-1">
                      <source src={ep.audio} type="audio/mpeg" />
                      Your browser does not support audio.
                    </audio>
                  ) : (
                    <p className="text-xs text-gray-500">No audio available</p>
                  )}

                  <button
                    onClick={() => navigate(`/show/${ep.showId || id}`)}
                    className="text-blue-600 hover:underline text-sm mt-2 block"
                  >
                    View Show
                  </button>

                  <button
                    onClick={() => removeFavorite(id)}
                    className="absolute top-2 right-2 text-red-500 text-lg"
                    aria-label="Remove favorite"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Match genre IDs to names
const genreIdToName = {
  1: "Personal Growth",
  2: "True Crime",
  3: "History",
  4: "Comedy",
  5: "Entertainment",
  6: "Business",
  7: "Fiction",
  8: "News",
  9: "Kids",
};
