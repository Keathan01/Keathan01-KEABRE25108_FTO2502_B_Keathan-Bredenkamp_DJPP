// src/pages/HomePage.js

import React, { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FilterContext } from "../context/FilterContext";

export default function HomePage() {
  const { filters, setFilters } = useContext(FilterContext);
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  const genreMap = {
    1: "Technology",
    2: "Business",
    3: "True Crime",
    4: "Mystery",
    5: "Comedy",
    6: "Entertainment",
    7: "Health",
    8: "Lifestyle",
    9: "Sports",
    10: "News",
    11: "History",
    12: "Education",
    13: "Science",
    14: "Nature",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://podcast-api.netlify.app/shows");
        const data = await res.json();

        const detailed = await Promise.all(
          data.map((show) =>
            fetch(`https://podcast-api.netlify.app/id/${show.id}`).then((res) =>
              res.json()
            )
          )
        );

        setShows(detailed);

        const allGenres = new Set();
        detailed.forEach((show) => {
          (show.genres || []).forEach((g) => allGenres.add(genreMap[g] || g));
        });
        setGenres(Array.from(allGenres));
      } catch (err) {
        console.error("Failed to load shows", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setFavorites(JSON.parse(localStorage.getItem("favorites")) || []);
  }, []);

  const toggleFavorite = (show) => {
    const updated = favorites.some((f) => f.id === show.id)
      ? favorites.filter((f) => f.id !== show.id)
      : [...favorites, { ...show, addedAt: Date.now() }];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const filteredShows = shows
    .filter((show) => {
      const matchesSearch = show.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const genreNames = (show.genres || []).map((g) => genreMap[g] || g);
      const matchesGenre = !filters.genre || genreNames.includes(filters.genre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (filters.sort === "newest")
        return new Date(b.updated) - new Date(a.updated);
      if (filters.sort === "az") return a.title.localeCompare(b.title);
      if (filters.sort === "za") return b.title.localeCompare(a.title);
      return 0;
    });

  const scrollCarousel = (direction) => {
    const el = carouselRef.current;
    if (!el) return;

    const cardWidth = 220 + 16;
    const visibleWidth = el.offsetWidth;
    const scrollAmount = cardWidth * 3;

    if (direction === "right") {
      if (el.scrollLeft + visibleWidth >= el.scrollWidth - cardWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 0) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  const recommended = [...shows].sort(() => 0.5 - Math.random()).slice(0, 10);

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search podcasts..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-4 py-2 rounded border w-full sm:w-auto  text-black dark:text-black "
        />
        <select
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          className="px-4 py-2 rounded border w-full sm:w-auto dark:text-black"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="px-4 py-2 rounded border w-full sm:w-auto  text-black dark:text-black"
        >
          <option value="newest">Recently Updated</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <button
          onClick={() => setFilters({ search: "", genre: "", sort: "newest" })}
          className="px-4 py-2 border rounded bg-red-100 hover:bg-red-200 text-black dark:text-black"
        >
          ❌ Clear Filters
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">🕺 Recommended Shows</h2>
          <div className="space-x-2">
            <button onClick={() => scrollCarousel("left")} className="text-xl">
              ⬅️
            </button>
            <button onClick={() => scrollCarousel("right")} className="text-xl">
              ➡️
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-4 carousel-container"
          style={{ scrollBehavior: "smooth" }}
        >
          {recommended.map((show) => {
            const seasons = show.seasons?.length || 0;
            const episodes = show.seasons?.reduce(
              (sum, s) => sum + (s.episodes?.length || 0),
              0
            );
            return (
              <div
                key={show.id}
                className="min-w-[220px] bg-white dark:bg-gray-800 rounded shadow"
              >
                <Link to={`/show/${show.id}`}>
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-full h-36 object-cover rounded-t"
                  />
                  <div className="p-2">
                    <h3 className="text-sm font-semibold truncate">
                      {show.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {show.genres
                        ?.map((g) => genreMap[g] || g)
                        .slice(0, 2)
                        .join(", ") || "Unknown Genre"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {seasons} season{seasons !== 1 ? "s" : ""}, {episodes}{" "}
                      episode{episodes !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredShows.map((show) => {
            const genreTags = (show.genres || []).map((g) => genreMap[g] || g);
            const seasons = show.seasons?.length || 1;
            return (
              <div
                key={show.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow relative hover:shadow-lg"
              >
                <Link to={`/show/${show.id}`}>
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h3 className="mt-2 font-semibold">{show.title}</h3>
                  <p className="text-sm text-gray-500">
                    {seasons} season{seasons > 1 ? "s" : ""}
                  </p>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
                    {genreTags.slice(0, 2).map((g, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated{" "}
                    {Math.floor(
                      (Date.now() - new Date(show.updated)) / 86400000
                    )}{" "}
                    days ago
                  </p>
                </Link>
                <button
                  onClick={() => toggleFavorite(show)}
                  className="absolute top-2 right-2 text-xl"
                >
                  {isFavorite(show.id) ? "❤️" : "🤍"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
