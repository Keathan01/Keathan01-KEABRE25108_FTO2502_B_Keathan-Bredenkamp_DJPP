import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Episodes from "../components/Episodes";

export default function ShowDetailPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSeasons, setExpandedSeasons] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resShow = await fetch(
          `https://podcast-api.netlify.app/id/${showId}`
        );
        const showData = await resShow.json();
        setShow(showData);
      } catch (err) {
        console.error(err);
        setError("Failed to load show details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, [showId]);

  const toggleFavorite = (episode) => {
    const exists = favorites.some((f) => f.id === episode.id);
    const updated = exists
      ? favorites.filter((f) => f.id !== episode.id)
      : [
          ...favorites,
          {
            ...episode,
            showTitle: show?.title,
            showId,
            addedAt: Date.now(),
          },
        ];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const playEpisode = (url, id, queue = []) => {
    window.dispatchEvent(
      new CustomEvent("play-audio", {
        detail: {
          url,
          id,
          queue,
        },
      })
    );
  };

  const toggleSeason = (season) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [season]: !prev[season],
    }));
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!show) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-40">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        ← Go Back
      </button>

      <h2 className="text-3xl font-bold text-center mb-4">{show.title}</h2>
      <img
        src={show.image}
        alt={show.title}
        className="mx-auto w-32 h-32 object-cover rounded mb-4"
      />
      <p className="text-center mb-6 text-gray-700 dark:text-gray-300">
        {show.description || "No description available."}
      </p>

      <h3 className="text-xl font-semibold mb-6">
        {show.seasons.length} Season(s),{" "}
        {show.seasons.reduce(
          (acc, season) => acc + (season.episodes?.length || 0),
          0
        )}{" "}
        Episode(s)
      </h3>

      {show.seasons.map((season) => (
        <div key={season.season} className="mb-6">
          <button
            onClick={() => toggleSeason(season.season)}
            className="w-full text-left font-bold text-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md mb-2"
          >
            Season {season.season} {expandedSeasons[season.season] ? "▲" : "▼"}
          </button>

          {expandedSeasons[season.season] && (
            <Episodes
              episodes={season.episodes || []}
              onPlay={(url, id) => playEpisode(url, id, season.episodes || [])}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      ))}
    </div>
  );
}
