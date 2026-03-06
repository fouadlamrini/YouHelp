import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone } from 'react-icons/fi';
import { getSocket } from '../services/socket';

const VideoCall = ({ callData, onEnd, onConnected }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const onConnectedCalledRef = useRef(false);

  const attachAndPlay = (el, stream) => {
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  };

  // Attach streams to video elements once refs are ready (after mount)
  useEffect(() => {
    const el = localVideoRef.current;
    const stream = localStreamRef.current;
    if (el && stream) {
      attachAndPlay(el, stream);
    }
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    const stream = remoteStreamRef.current;
    if (el && stream) {
      attachAndPlay(el, stream);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!callData) return;
    console.log('[VideoCall] 🎬 Mounted with callData:', {
      currentUserId: callData.currentUserId,
      otherUserId: callData.otherUserId,
      isInitiator: callData.isInitiator,
      otherUserName: callData.otherUserName
    });
    setIsInitiator(callData.isInitiator);
    initializeCall();
    return () => cleanup();
  }, [callData]);

  const initializeCall = async () => {
    try {
      console.log('🎥 Initializing video call...', callData);
      pendingOfferRef.current = null;
      pendingIceCandidatesRef.current = [];

      // 1. Socket first (sync)
      socketRef.current = getSocket();
      if (!socketRef.current) {
        console.error('[VideoCall] ❌ Socket not available');
        setConnectionState('error');
        return;
      }
      setConnectionState('creating-peer');

      // 2. Create peer connection (sync)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceCandidatePoolSize: 10
      });
      peerConnection.current = pc;

      // 3. Register socket listeners IMMEDIATELY so we never miss offer/answer/ice
      socketRef.current.on('offer', async ({ offer, from }) => {
        const match = String(from) === String(callData.otherUserId);
        console.log('[VideoCall] 📥 Socket "offer" received:', { from, expected: callData.otherUserId, match });
        if (!match) {
          console.warn('[VideoCall] ⚠️ Ignored offer (from mismatch)');
          return;
        }
        const hasTracks = !!localStreamRef.current;
        console.log('[VideoCall] 🤝 Processing offer, hasLocalTracks:', hasTracks);
        if (!hasTracks) {
          pendingOfferRef.current = offer;
          console.log('[VideoCall] 📌 Offer stored (will process after getUserMedia)');
          return;
        }
        await handleOffer(offer);
      });

      socketRef.current.on('answer', async ({ answer, from }) => {
        const match = String(from) === String(callData.otherUserId);
        if (match) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            setConnectionState('waiting-for-connection');
            await flushPendingIceCandidates();
          } catch (e) {
            console.error('[VideoCall] ❌ setRemoteDescription error:', e);
          }
        }
      });

      const addIceCandidateSafe = async (cand) => {
        if (pc.signalingState === 'closed') return;
        if (!pc.remoteDescription) {
          pendingIceCandidatesRef.current.push(cand);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error('[VideoCall] ❌ Error adding ICE candidate:', e);
        }
      };
      const flushPendingIceCandidates = async () => {
        const pending = pendingIceCandidatesRef.current;
        pendingIceCandidatesRef.current = [];
        for (const cand of pending) {
          try {
            if (pc.signalingState !== 'closed') await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error('[VideoCall] ❌ Error adding pending ICE candidate:', e);
          }
        }
      };

      socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
        if (String(from) !== String(callData.otherUserId)) return;
        await addIceCandidateSafe(candidate);
      });

      // Callee: tell caller we're ready so they send the offer (avoids offer sent before we listen)
      if (!callData.isInitiator) {
        socketRef.current.emit('callee-ready', { to: callData.otherUserId });
        console.log('[VideoCall] 📤 Callee-ready emitted (waiting for offer)');
      }

      const handleOffer = async (offer) => {
        setConnectionState('receiving-offer');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIceCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('answer', { answer, to: callData.otherUserId });
        console.log('[VideoCall] 📤 Answer emitted');
        setConnectionState('waiting-for-connection');
      };

      // 4. PC handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            candidate: event.candidate,
            to: callData.otherUserId
          });
        }
      };
      pc.oniceconnectionstatechange = () => {
        console.log('[VideoCall] 🧊 ICE connection state:', pc.iceConnectionState);
      };
      const maybeCallOnConnected = () => {
        if (!onConnectedCalledRef.current && typeof onConnected === 'function') {
          onConnectedCalledRef.current = true;
          onConnected();
        }
      };
      pc.onconnectionstatechange = () => {
        console.log('[VideoCall] 🔗 RTCPeerConnection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setConnectionState('connected');
          maybeCallOnConnected();
        } else if (pc.connectionState === 'failed') {
          setConnectionState('failed');
        }
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        console.log('[VideoCall] 📹 ontrack received');
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        const el = remoteVideoRef.current;
        if (el) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
        setIsConnected(true);
        setConnectionState('connected');
        maybeCallOnConnected();
      };

      // 5. Get user media then add tracks
      setConnectionState('getting-media');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('[VideoCall] ✅ Local media obtained');

      // If PC was closed (e.g. cleanup/unmount or Strict Mode re-run), stop stream and exit
      if (pc.signalingState === 'closed') {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 6. Process pending offer if we received it before having tracks
      if (pc.signalingState === 'closed') {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      if (pendingOfferRef.current) {
        const offer = pendingOfferRef.current;
        pendingOfferRef.current = null;
        console.log('[VideoCall] 📌 Processing stored offer');
        await handleOffer(offer);
      }

      if (pc.signalingState === 'closed') return;

      // 7. Join
      socketRef.current.emit('join-video-call', {
        userId: callData.currentUserId,
        otherUserId: callData.otherUserId
      });

      // 8. Initiator: wait for "callee-ready" then send offer (so callee never misses it)
      if (callData.isInitiator) {
        setConnectionState('waiting-for-callee');
        socketRef.current.once('callee-ready', async ({ from }) => {
          if (String(from) !== String(callData.otherUserId) || pc.signalingState === 'closed') return;
          setConnectionState('creating-offer');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('offer', { offer, to: callData.otherUserId });
          console.log('[VideoCall] 📤 Offer emitted (after callee-ready)');
          setConnectionState('waiting-for-answer');
        });
      }

    } catch (error) {
      console.error('[VideoCall] ❌ Error initializing call:', error);
      setConnectionState('error');
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onEnd();
  };

  const cleanup = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (socketRef.current) {
      socketRef.current.off('offer');
      socketRef.current.off('answer');
      socketRef.current.off('ice-candidate');
      socketRef.current.off('callee-ready');
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'getting-media': return 'Getting camera...';
      case 'connecting-socket': return 'Connecting...';
      case 'creating-peer': return 'Setting up...';
      case 'waiting-for-callee': return 'Connecting...';
      case 'creating-offer': return 'Calling...';
      case 'waiting-for-answer': return 'Ringing...';
      case 'receiving-offer': return 'Incoming call...';
      case 'waiting-for-connection': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'failed': return 'Failed';
      case 'error': return 'Error';
      default: return 'Connecting...';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <div className="text-white">
          <h3 className="font-semibold">
            {isInitiator ? 'Calling...' : 'Incoming Call'}
          </h3>
          <p className="text-sm text-slate-300">
            {callData?.otherUserName || 'User'} • {getConnectionStatusText()}
          </p>
        </div>
        <button
          onClick={endCall}
          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (Full screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: remoteStream ? 'block' : 'none' }}
        />

        {/* Local Video (Picture in picture) - above overlay so user always sees their camera */}
        <div className="absolute top-4 right-4 w-40 h-32 bg-slate-800 rounded-lg overflow-hidden border-2 border-white z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Connection Status / Placeholder - behind local video (z-20) */}
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">{getConnectionStatusText()}</p>
              <p className="text-sm text-slate-300 mt-2">
                {callData?.otherUserName || 'User'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-700'
          }`}
        >
          {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-700'
          }`}
        >
          {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>
        
        <button
          onClick={endCall}
          className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600"
        >
          <FiPhone size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
