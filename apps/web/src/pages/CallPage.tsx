import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { callAPI } from '../api';

export default function CallPage({ userId, socket }) {
  const { dealId } = useParams();
  const [status, setStatus] = useState('idle'); // idle, ringing, active, ended
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // WebRTC 설정
    const iceServers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    peerConnectionRef.current = new RTCPeerConnection(iceServers);

    // 로컬 미디어 스트림 가져오기
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });
      })
      .catch((error) => {
        console.error('미디어 장치 접근 실패:', error);
      });

    // 원격 스트림 수신
    peerConnectionRef.current.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // ICE Candidate 처리
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal:ice-candidate', {
          dealId,
          candidate: event.candidate
        });
      }
    };

    // Socket 이벤트 리스너
    socket.on('call:incoming', () => {
      setStatus('ringing');
    });

    socket.on('call:accepted', async () => {
      setStatus('active');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit('signal:offer', { dealId, offer });
    });

    socket.on('signal:offer', async (data) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('signal:answer', { dealId, answer });
    });

    socket.on('signal:answer', async (data) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    });

    socket.on('signal:ice-candidate', async (data) => {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    });

    socket.on('call:ended', () => {
      setStatus('ended');
      endCall();
    });

    return () => {
      endCall();
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('signal:offer');
      socket.off('signal:answer');
      socket.off('signal:ice-candidate');
      socket.off('call:ended');
    };
  }, [socket, dealId]);

  const startCall = async () => {
    try {
      await callAPI.initiateCall({ dealId, callerId: userId });
      socket?.emit('call:initiate', { dealId, callerId: userId });
    } catch (error) {
      console.error('통화 시작 실패:', error);
    }
  };

  const acceptCall = () => {
    setStatus('active');
    socket?.emit('call:accept', { dealId });
  };

  const rejectCall = () => {
    setStatus('idle');
    socket?.emit('call:reject', { dealId });
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket?.emit('call:end', { dealId });
    setStatus('ended');
  };

  return (
    <div className="call-page">
      <h1>비디오 통화</h1>
      
      <div className="video-container">
        <div className="local-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />
          <p>나</p>
        </div>

        {remoteStream && (
          <div className="remote-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
            <p>상대방</p>
          </div>
        )}
      </div>

      <div className="call-controls">
        {status === 'idle' && (
          <button className="btn-call" onClick={startCall}>
            📞 전화 걸기
          </button>
        )}

        {status === 'ringing' && (
          <>
            <button className="btn-accept" onClick={acceptCall}>
              ✓ 수락
            </button>
            <button className="btn-reject" onClick={rejectCall}>
              ✕ 거절
            </button>
          </>
        )}

        {status === 'active' && (
          <button className="btn-end" onClick={endCall}>
            📵 통화 종료
          </button>
        )}

        {status === 'ended' && (
          <p>통화가 종료되었습니다.</p>
        )}
      </div>

      <p className="status">상태: {status}</p>
    </div>
  );
}
