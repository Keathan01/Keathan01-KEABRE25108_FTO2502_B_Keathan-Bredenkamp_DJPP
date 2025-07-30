import React from "react";

export default function Episodes({
  episodes,
  onPlay,
  favorites,
  onToggleFavorite,
}) {
  if (!episodes || episodes.length === 0) {
    return (
      <p className="text-gray-500">No episodes available for this season.</p>
    );
  }

  return (
    <div className="space-y-4">
      {episodes.map((ep) => {
        // ✅ Generate a unique ID if not present
        const episodeId =
          ep.id ||
          ep.uuid ||
          `${ep.title}-${ep.seasonNumber || ""}-${ep.episodeNumber || ""}`;

        // ✅ Favoriting check based on computed ID
        const isFav = favorites?.some((f) => f.id === episodeId);

        const progressData =
          JSON.parse(localStorage.getItem("listeningProgress") || "{}")[
            episodeId
          ] || {};

        const progress = (progressData.time / (ep.audio_length_sec || 1)) * 100;

        return (
          <div
            key={episodeId}
            className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center"
          >
            <div className="flex-1 pr-4">
              <h4 className="font-semibold text-md">{ep.title}</h4>
              <p className="text-sm text-gray-500">
                {ep.date || "Unknown date"}
              </p>
              {progressData && (
                <div className="w-full bg-gray-300 h-1.5 rounded mt-1">
                  <div
                    className="h-1.5 bg-green-500 rounded transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => ep.file && onPlay(ep.file, episodeId, episodes)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                ▶ Play
              </button>

              {/* ✅ Favoriting uses ID and passes it */}
              <button
                onClick={() =>
                  onToggleFavorite({
                    ...ep,
                    id: episodeId, // ensure ID gets saved
                  })
                }
                className="text-xl"
              >
                {isFav ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
