// client/src/components/SocketManager.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectToken } from '../features/auth/authSlice';
import { initSocket, getSocket, on, off, cleanupSocket } from '../utils/socket';

/**
 * SocketManager
 * - initializes socket when token exists
 * - sets up default listeners for 'notification' and 'message'
 * - shows browser Notification for 'notification' events (requests permission)
 *
 * Mount this once (e.g. inside App component) so socket lives for the session.
 */
export default function SocketManager() {
  const token = useSelector(selectToken);

  useEffect(() => {
    // if no token, ensure socket is cleaned up
    if (!token) {
      try {
        cleanupSocket();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Socket cleanup error', e);
      }
      return;
    }

    // init socket with token (initSocket is idempotent if same token)
    const socket = initSocket(token);

    // helper to show browser notification
    const showBrowserNotification = async (title, body, opts = {}) => {
      try {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
          new Notification(title, { body, ...opts });
        } else if (Notification.permission !== 'denied') {
          const p = await Notification.requestPermission();
          if (p === 'granted') new Notification(title, { body, ...opts });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Notification failed', e);
      }
    };

    // sample notification handler (server should emit 'notification' with { title, body, data })
    const handleNotification = (payload) => {
      // show in console
      // eslint-disable-next-line no-console
      console.log('socket notification:', payload);

      // show browser notification if available
      const title = payload?.title || 'MadeInIndia';
      const body = payload?.body || payload?.message || 'You have a new notification';
      showBrowserNotification(title, body);
    };

    const handleMessage = (payload) => {
      // eslint-disable-next-line no-console
      console.log('socket message:', payload);
    };

    // register listeners
    on('notification', handleNotification);
    on('message', handleMessage);

    // Also example: listen for connect/disconnect events directly on socket
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('SocketManager: connected', socket.id);
    });

    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('SocketManager: disconnected', reason);
    });

    // cleanup on unmount or token change
    return () => {
      try {
        off('notification', handleNotification);
        off('message', handleMessage);
        socket.off('connect');
        socket.off('disconnect');
        // do not fully disconnect here to allow persistent socket if your app relies on it elsewhere.
        // If you prefer to disconnect on component unmount, call cleanupSocket() here.
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('SocketManager cleanup error', e);
      }
    };
  }, [token]);

  return null; // invisible component
}
