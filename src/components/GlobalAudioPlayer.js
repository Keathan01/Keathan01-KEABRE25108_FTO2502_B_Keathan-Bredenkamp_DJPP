import React, { useEffect, useRef, useState } from "react";

export default function GlobalAudioPlayer() {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedTrack = JSON.parse(localStorage.getItem("currentTrack"));
    const savedQueue = JSON.parse(localStorage.getItem("currentQueue"));
    if (savedTrack) setCurrentTrack(savedTrack);
    if (savedQueue) setQueue(savedQueue);

    const handlePlayEvent = (e) => {
      const { url, id, title, image, queue: incomingQueue } = e.detail;
      const newTrack = { url, id, title, image };
      setCurrentTrack(newTrack);
      setQueue(incomingQueue || []);
      setIsPlaying(true);
      localStorage.setItem("currentTrack", JSON.stringify(newTrack));
      localStorage.setItem("currentQueue", JSON.stringify(incomingQueue || []));
    };

    window.addEventListener("play-audio", handlePlayEvent);
    return () => window.removeEventListener("play-audio", handlePlayEvent);
  }, []);

  useEffect(() => {
    if (!currentTrack) return;
    const saved = JSON.parse(localStorage.getItem("listeningProgress") || "{}");
    const time = saved[currentTrack.id]?.time || 0;
    if (audioRef.current) audioRef.current.currentTime = time;
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
      if (currentTrack?.id) {
        const saved = JSON.parse(
          localStorage.getItem("listeningProgress") || "{}"
        );
        saved[currentTrack.id] = {
          time: audio.currentTime,
          duration: audio.duration,
        };
        localStorage.setItem("listeningProgress", JSON.stringify(saved));
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 🛡️ Warn user before closing/reloading while playing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleClose = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setQueue([]);
    localStorage.removeItem("currentTrack");
    localStorage.removeItem("currentQueue");
  };

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleNext = () => {
    const index = queue.findIndex((ep) => ep.id === currentTrack.id);
    const next = queue[index + 1];
    if (next) {
      window.dispatchEvent(
        new CustomEvent("play-audio", {
          detail: {
            url: next.file,
            id: next.id,
            title: next.title,
            image: next.image,
            queue,
          },
        })
      );
    }
  };

  const handlePrev = () => {
    const index = queue.findIndex((ep) => ep.id === currentTrack.id);
    const prev = queue[index - 1];
    if (prev) {
      window.dispatchEvent(
        new CustomEvent("play-audio", {
          detail: {
            url: prev.file,
            id: prev.id,
            title: prev.title,
            image: prev.image,
            queue,
          },
        })
      );
    } else {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (sec) =>
    isNaN(sec)
      ? "0:00"
      : `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(
          2,
          "0"
        )}`;

  if (!currentTrack?.url) return null;

  const index = queue.findIndex((ep) => ep.id === currentTrack.id);
  const nextTrack = queue[index + 1];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black text-white z-50 ${
        collapsed ? "p-2" : "p-4"
      } shadow-lg`}
    >
      <audio
        ref={audioRef}
        src={currentTrack.url}
        autoPlay
        onEnded={handleNext}
        onError={() => console.error("Audio error")}
      />

      {!collapsed ? (
        <>
          {/* Progress Bar */}
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (progress / duration) * 100 : 0}
              onChange={handleSeek}
              className="flex-1 mx-2 accent-green-500 h-1"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Main Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {currentTrack.image && (
                <img
                  src={currentTrack.image}
                  alt="cover"
                  className="w-12 h-12 object-cover rounded-md"
                />
              )}
              <div>
                <p className="font-semibold truncate max-w-xs">
                  {currentTrack.title || "Now Playing"}
                </p>
                {nextTrack && (
                  <p className="text-xs text-gray-400">
                    Next: {nextTrack.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={handlePrev}>⏮</button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white text-black rounded-full text-xl"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={handleNext}>⏭</button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-green-500"
              />
              <button onClick={toggleCollapse} title="Collapse">
                🔽
              </button>
              <button onClick={handleClose} title="Close">
                ❌
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-sm truncate">{currentTrack.title}</span>
          <div className="flex gap-3">
            <button onClick={toggleCollapse}>🔼</button>
            <button onClick={handleClose}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
}
