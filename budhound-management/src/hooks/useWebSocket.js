import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAppLifecycle } from './useAppLifecycle';
import toast from 'react-hot-toast';

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.store?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Close stale connection before reconnecting.
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent reconnect loop
      wsRef.current.close();
    }

    const wsUrl = `${import.meta.env.VITE_WS_URL}?store=${user.store.id}&user=${user.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected');
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'order:new':
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(`New order #${msg.data.order_number}`);
            break;
          case 'order:status_changed':
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['orders', msg.data.order_id]);
            break;
          case 'inventory:low_stock':
            queryClient.invalidateQueries(['inventory']);
            queryClient.invalidateQueries(['dashboard']);
            toast(`Low stock: ${msg.data.product_name}`);
            break;
          case 'order:assigned':
            queryClient.invalidateQueries(['orders']);
            toast(`Order #${msg.data.order_number} assigned to you`);
            break;
        }
      } catch (err) {
        console.error('[WS] Parse error:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 5s...');
      reconnectTimer.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [isAuthenticated, user, queryClient]);

  // Reconnect WebSocket + refetch stale data when app returns to foreground.
  useAppLifecycle({
    onResume: () => {
      console.log('[App] Resumed — reconnecting WS and refreshing data');
      connect();
      queryClient.invalidateQueries();
    },
  });

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);
}
