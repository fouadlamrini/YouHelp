import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const JITSI_DOMAIN = "meet.jit.si";

export default function VideoCallPage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room") || "YouHelpRoom";
  const containerRef = useRef(null);

  const apiRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!window.JitsiMeetExternalAPI) return;
      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: roomName.replace(/\s+/g, ""),
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
      });
    };
    document.body.appendChild(script);
    return () => {
      if (apiRef.current?.dispose) apiRef.current.dispose();
      apiRef.current = null;
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [roomName]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col">
      <div className="p-2 bg-slate-800 text-white text-sm font-medium">
        Room: <span className="text-indigo-300">{roomName}</span> — Share the link with the other person to join.
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
