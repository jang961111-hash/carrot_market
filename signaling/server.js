require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

// 활성 통화 및 사용자 소켓 저장
const activeCalls = new Map(); // dealId => {callerId, receiverId, callerSocketId, receiverSocketId}
const userSockets = new Map();  // userId => socketId

app.get('/health', (req, res) => {
  res.send('Signaling Server OK');
});

io.on('connection', (socket) => {
  console.log(`[연결] 클라이언트 연결됨: ${socket.id}`);

  // 사용자 등록
  socket.on('user:join', (data) => {
    const { userId } = data;
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`[사용자 등록] userId: ${userId}, socketId: ${socket.id}`);
    socket.emit('user:joined', { userId, socketId: socket.id });
  });

  // 통화 시작
  socket.on('call:initiate', (data) => {
    const { dealId, callerId, receiverId } = data;
    
    const receiverSocketId = userSockets.get(receiverId);
    if (!receiverSocketId) {
      socket.emit('call:error', { message: '수신자가 오프라인입니다.' });
      return;
    }

    activeCalls.set(dealId, {
      callerId,
      receiverId,
      callerSocketId: socket.id,
      receiverSocketId
    });

    console.log(`[통화 시작] dealId: ${dealId}, ${callerId} → ${receiverId}`);
    
    io.to(receiverSocketId).emit('call:incoming', {
      dealId,
      callerId,
      callerSocketId: socket.id
    });
  });

  // 통화 수락
  socket.on('call:accept', (data) => {
    const { dealId } = data;
    const call = activeCalls.get(dealId);
    
    if (!call) {
      socket.emit('call:error', { message: '통화 정보를 찾을 수 없습니다.' });
      return;
    }

    console.log(`[통화 수락] dealId: ${dealId}`);
    io.to(call.callerSocketId).emit('call:accepted', { dealId });
  });

  // 통화 거절
  socket.on('call:reject', (data) => {
    const { dealId } = data;
    const call = activeCalls.get(dealId);
    
    if (!call) return;

    console.log(`[통화 거절] dealId: ${dealId}`);
    io.to(call.callerSocketId).emit('call:rejected', { dealId });
    activeCalls.delete(dealId);
  });

  // WebRTC Offer 전달
  socket.on('signal:offer', (data) => {
    const { dealId, offer } = data;
    const call = activeCalls.get(dealId);
    
    if (!call) return;

    console.log(`[SDP Offer 전달] dealId: ${dealId}`);
    io.to(call.receiverSocketId).emit('signal:offer', { dealId, offer });
  });

  // WebRTC Answer 전달
  socket.on('signal:answer', (data) => {
    const { dealId, answer } = data;
    const call = activeCalls.get(dealId);
    
    if (!call) return;

    console.log(`[SDP Answer 전달] dealId: ${dealId}`);
    io.to(call.callerSocketId).emit('signal:answer', { dealId, answer });
  });

  // ICE Candidate 전달
  socket.on('signal:ice-candidate', (data) => {
    const { dealId, candidate, targetUserId } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (!targetSocketId) return;

    console.log(`[ICE Candidate 전달] dealId: ${dealId}`);
    io.to(targetSocketId).emit('signal:ice-candidate', { dealId, candidate });
  });

  // 통화 종료
  socket.on('call:end', (data) => {
    const { dealId } = data;
    const call = activeCalls.get(dealId);
    
    if (!call) return;

    console.log(`[통화 종료] dealId: ${dealId}`);
    
    io.to(call.callerSocketId).emit('call:ended', { dealId });
    io.to(call.receiverSocketId).emit('call:ended', { dealId });
    
    activeCalls.delete(dealId);
  });

  // 채팅방 입장
  socket.on('chat:join-room', (data) => {
    const { roomId } = data;
    socket.join(`chat:${roomId}`);
    console.log(`[채팅방 입장] roomId: ${roomId}, socketId: ${socket.id}`);
    socket.to(`chat:${roomId}`).emit('chat:user-joined', { roomId, userId: socket.userId });
  });

  // 채팅 메시지
  socket.on('chat:message', (data) => {
    const { roomId, message } = data;
    console.log(`[채팅 메시지] roomId: ${roomId}`);
    io.to(`chat:${roomId}`).emit('chat:message', message);
  });

  // 채팅방 퇴장
  socket.on('chat:leave-room', (data) => {
    const { roomId } = data;
    socket.leave(`chat:${roomId}`);
    console.log(`[채팅방 퇴장] roomId: ${roomId}, socketId: ${socket.id}`);
    socket.to(`chat:${roomId}`).emit('chat:user-left', { roomId, userId: socket.userId });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`[연결 해제] socketId: ${socket.id}`);
    
    // 사용자 소켓 제거
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
    
    // 활성 통화 정리
    for (const [dealId, call] of activeCalls.entries()) {
      if (call.callerSocketId === socket.id || call.receiverSocketId === socket.id) {
        const otherSocketId = call.callerSocketId === socket.id 
          ? call.receiverSocketId 
          : call.callerSocketId;
        
        io.to(otherSocketId).emit('call:ended', { dealId, reason: 'disconnect' });
        activeCalls.delete(dealId);
        console.log(`[통화 종료 (연결 해제)] dealId: ${dealId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Signaling Server listening on http://localhost:${PORT}\n`);
});
