import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMic, FiMicOff, FiPhone } from 'react-icons/fi';
import { getSocket } from '../services/socket';

const VoiceCall = ({ callData, onEnd }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');

  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  // Lire le flux audio distant (sans ça on n'entend pas l'autre)
  useEffect(() => {
    const el = remoteAudioRef.current;
    const stream = remoteStreamRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [remoteStream]);

  useEffect(() => {
    if (!callData) return;
    setIsInitiator(callData.isInitiator);
    initializeCall();
    return () => cleanup();
  }, [callData]);

  const initializeCall = async () => {
    try {
      pendingOfferRef.current = null;
      pendingIceCandidatesRef.current = [];

      socketRef.current = getSocket();
      if (!socketRef.current) {
        setConnectionState('error');
        return;
      }
      setConnectionState('creating-peer');

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceCandidatePoolSize: 10
      });
      peerConnection.current = pc;

      socketRef.current.on('voice-offer', async ({ offer, from }) => {
        if (String(from) !== String(callData.otherUserId)) return;
        const hasTracks = !!localStreamRef.current;
        if (!hasTracks) {
          pendingOfferRef.current = offer;
          return;
        }
        await handleOffer(offer);
      });

      socketRef.current.on('voice-answer', async ({ answer, from }) => {
        if (String(from) !== String(callData.otherUserId)) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          setConnectionState('waiting-for-connection');
          await flushPendingIceCandidates();
        } catch (e) {
          console.error('[VoiceCall] setRemoteDescription error:', e);
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
          console.error('[VoiceCall] Error adding ICE candidate:', e);
        }
      };
      const flushPendingIceCandidates = async () => {
        const pending = pendingIceCandidatesRef.current;
        pendingIceCandidatesRef.current = [];
        for (const cand of pending) {
          try {
            if (pc.signalingState !== 'closed') await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {}
        }
      };

      socketRef.current.on('voice-ice-candidate', async ({ candidate, from }) => {
        if (String(from) !== String(callData.otherUserId)) return;
        await addIceCandidateSafe(candidate);
      });

      if (!callData.isInitiator) {
        socketRef.current.emit('voice-callee-ready', { to: callData.otherUserId });
      }

      const handleOffer = async (offer) => {
        setConnectionState('receiving-offer');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIceCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('voice-answer', { answer, to: callData.otherUserId });
        setConnectionState('waiting-for-connection');
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('voice-ice-candidate', {
            candidate: event.candidate,
            to: callData.otherUserId
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setConnectionState('connected');
        } else if (pc.connectionState === 'failed') {
          setConnectionState('failed');
        }
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (!stream) return;
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        setIsConnected(true);
        setConnectionState('connected');
        const el = remoteAudioRef.current;
        if (el) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
      };

      setConnectionState('getting-media');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      if (pc.signalingState === 'closed') {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      if (pendingOfferRef.current) {
        const offer = pendingOfferRef.current;
        pendingOfferRef.current = null;
        await handleOffer(offer);
      }

      if (pc.signalingState === 'closed') return;

      socketRef.current.emit('join-voice-call', {
        userId: callData.currentUserId,
        otherUserId: callData.otherUserId
      });

      if (callData.isInitiator) {
        setConnectionState('waiting-for-callee');
        socketRef.current.once('voice-callee-ready', async ({ from }) => {
          if (String(from) !== String(callData.otherUserId) || pc.signalingState === 'closed') return;
          setConnectionState('creating-offer');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('voice-offer', { offer, to: callData.otherUserId });
          setConnectionState('waiting-for-answer');
        });
      }
    } catch (error) {
      console.error('[VoiceCall] Error initializing call:', error);
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
      socketRef.current.off('voice-offer');
      socketRef.current.off('voice-answer');
      socketRef.current.off('voice-ice-candidate');
      socketRef.current.off('voice-callee-ready');
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'getting-media': return 'Activation du micro...';
      case 'creating-peer': return 'Préparation...';
      case 'waiting-for-callee': return 'Appel en cours...';
      case 'creating-offer': return 'Appel...';
      case 'waiting-for-answer': return 'Sonnerie...';
      case 'receiving-offer': return 'Appel entrant...';
      case 'waiting-for-connection': return 'Connexion...';
      case 'connected': return 'En cours';
      case 'failed': return 'Échec';
      case 'error': return 'Erreur';
      default: return 'Connexion...';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col items-center justify-center">
      {/* Élément audio pour jouer la voix de l'autre (invisible mais obligatoire pour entendre) */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">
              {(callData?.otherUserName || 'U')[0]}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {isInitiator ? 'Appel en cours...' : 'Appel entrant'}
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            {callData?.otherUserName || 'Utilisateur'}
          </p>
          <p className="text-indigo-300 text-xs mt-2">{getConnectionStatusText()}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <button
            onClick={endCall}
            className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600"
          >
            <FiPhone size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;
