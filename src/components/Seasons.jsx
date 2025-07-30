import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Seasons() {
  const { showId } = useParams();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSeasons() {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching
        const res = await fetch(`https://podcast-api.netlify.app/id/${showId}`);
        if (!res.ok) throw new Error("Failed to fetch seasons");
        const data = await res.json();
        setSeasons(data.seasons || []);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchSeasons();
  }, [showId]);

  if (loading) {
    return <p className="text-gray-500">Loading seasons...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Error: {error}.{" "}
        <a href="/" className="text-blue-500 underline">
          Go back to the homepage
        </a>
      </p>
    );
  }

  if (!seasons.length) {
    return (
      <p className="text-gray-500">
        No seasons found.{" "}
        <a href="/" className="text-blue-500 underline">
          Go back to the homepage
        </a>
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Seasons</h2>
      <ul className="list-disc pl-5">
        {seasons.map(({ season, episodes }) => (
          <li key={season} className="mb-2">
            <Link
              to={`/shows/${showId}/seasons/${season}`}
              className="text-blue-500 underline"
              aria-label={`View episodes for season ${season}`}
            >
              Season {season} ({episodes?.length || 0} episodes)
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
