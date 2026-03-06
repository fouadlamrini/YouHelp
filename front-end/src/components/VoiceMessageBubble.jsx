import React, { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause, FiCheck, FiTrash2 } from "react-icons/fi";

const SPEEDS = [1, 1.5, 2];

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VoiceMessageBubble = ({ src, isMe, createdAt, onDelete }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const speed = SPEEDS[speedIndex];

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoadedMetadata = () => {
      setDuration(el.duration);
      setLoaded(true);
    };
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play();
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const value = parseFloat(e.target.value);
    el.currentTime = value;
    setCurrentTime(value);
  };

  const cycleSpeed = () => {
    setSpeedIndex((i) => (i + 1) % SPEEDS.length);
  };

  const displayDuration = loaded
    ? `${formatDuration(currentTime)} / ${formatDuration(duration)}`
    : "0:00 / 0:00";

  return (
    <div
      className={`flex flex-col min-w-[200px] max-w-[280px] p-3 rounded-2xl shadow-sm ${
        isMe
          ? "bg-[#D9FDD3] text-slate-800 rounded-tr-md self-end"
          : "bg-white border border-slate-200 text-slate-800 rounded-tl-md"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={cycleSpeed}
          className="flex-shrink-0 px-2 py-1 rounded-full bg-slate-700 text-white text-[10px] font-bold hover:bg-slate-600"
        >
          {speed}x
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
        >
          {playing ? <FiPause size={14} className="ml-0" /> : <FiPlay size={14} className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-full appearance-none bg-slate-300 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-700 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-700 [&::-moz-range-thumb]:border-0"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-600">
            <span className="font-medium tabular-nums">{displayDuration}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-1">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="opacity-70 hover:opacity-100 p-0.5 rounded"
            title="Supprimer"
          >
            <FiTrash2 size={12} />
          </button>
        )}
        <span className="text-[10px] text-slate-500">{createdAt}</span>
        {isMe && (
          <span className="text-slate-500" title="Envoyé">
            <FiCheck size={12} strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
};

export default VoiceMessageBubble;
