// client/src/utils/socket.js
// Singleton Socket.io client helper
import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

/**
 * initSocket(token, opts)
 * - token: JWT string (required to authenticate)
 * - opts: optional object { url, autoConnect }
 *
 * Returns the socket instance.
 */
export function initSocket(token, opts = {}) {
  const url = opts.url || process.env.REACT_APP_API_SOCKET || (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:4000');
  const autoConnect = opts.autoConnect !== undefined ? opts.autoConnect : true;

  // If socket exists and token unchanged, return it
  if (socket && token === currentToken) {
    return socket;
  }

  // If token changed, disconnect previous socket
  if (socket && socket.connected) {
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socket = null;
  }

  currentToken = token;

  // create socket instance, send token via auth payload (server will verify)
  socket = io(url, {
    autoConnect,
    transports: ['websocket', 'polling'],
    auth: {
      token: token ? `Bearer ${token}` : null,
    },
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Useful logging (toggle off in production)
  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('🔌 socket connected', socket.id);
  });
  socket.on('disconnect', (reason) => {
    // eslint-disable-next-line no-console
    console.log('🔌 socket disconnected', reason);
  });
  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('🔌 socket connect_error', err.message);
  });

  return socket;
}

/**
 * getSocket()
 * - returns the socket instance if created, otherwise null
 */
export function getSocket() {
  return socket;
}

/**
 * on(event, handler)
 * off(event, handler)
 * emit(event, payload)
 * simple wrappers to avoid importing socket.io-client everywhere
 */
export function on(event, handler) {
  if (!socket) return;
  socket.on(event, handler);
}
export function off(event, handler) {
  if (!socket) return;
  socket.off(event, handler);
}
export function emit(event, payload, ack) {
  if (!socket) return;
  socket.emit(event, payload, ack);
}

/**
 * cleanupSocket()
 * Disconnects and clears the socket
 */
export function cleanupSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
    currentToken = null;
  }
}
