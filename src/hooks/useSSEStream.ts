import { useState, useEffect, useRef, useCallback } from 'react';
import { env } from '@/config/env';

const API_BASE_URL = env.API_BASE_URL;
const BASE_PATH = '/api/v1';

interface UseSSEStreamOptions<T> {
  /** Full path after /api/v1, e.g. `/fixtures/123/predictions/stream` */
  path: string | null;
  /** Whether the stream should be active. Set false to disconnect. */
  enabled?: boolean;
  /** Delay in ms before connecting (default 0) */
  delay?: number;
  /** Max reconnect attempts before giving up (default 5) */
  maxRetries?: number;
  /** Base delay between retries in ms, doubles each attempt (default 2000) */
  retryBaseDelay?: number;
  /** Optional transform applied to each parsed JSON message */
  transform?: (raw: unknown) => T;
}

interface UseSSEStreamResult<T> {
  data: T | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Reusable hook that connects to an SSE endpoint using fetch + ReadableStream.
 *
 * Uses fetch instead of EventSource so we can send custom Authorization
 * and X-Device-ID headers.
 *
 * Handles:
 * - Connecting with auth headers (Bearer token + X-Device-ID)
 * - Manual SSE line parsing (`data: {...}\n\n`)
 * - Automatic reconnect on error with exponential back-off
 * - Cleanup / abort on unmount or when `path` / `enabled` changes
 */
export function useSSEStream<T = unknown>(
  options: UseSSEStreamOptions<T>,
): UseSSEStreamResult<T> {
  const {
    path,
    enabled = true,
    delay = 0,
    maxRetries = 5,
    retryBaseDelay = 2000,
    transform,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs so the connect function always sees the latest values
  // without re-triggering the effect.
  const retriesRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const connect = useCallback(async () => {
    if (!path) return;

    const token = localStorage.getItem('access_token');
    const deviceId = localStorage.getItem('device_id') || '';

    const url = `${API_BASE_URL}${BASE_PATH}${path}`;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Device-ID': deviceId,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('SSE response has no body (ReadableStream not supported)');
      }

      setIsConnected(true);
      setError(null);
      retriesRef.current = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are delimited by double newlines
        const messages = buffer.split('\n\n');
        // Keep the last (possibly incomplete) chunk in the buffer
        buffer = messages.pop() || '';

        for (const message of messages) {
          // Parse each line of the SSE message
          const lines = message.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const transformed = transformRef.current
                  ? transformRef.current(parsed)
                  : (parsed as T);
                setData(transformed);
              } catch {
                // Skip malformed JSON lines
                if (env.ENABLE_DEBUG_LOGGING) {
                  console.warn('[SSE] Failed to parse JSON:', jsonStr);
                }
              }
            }
            // Ignore other SSE fields like `event:`, `id:`, `retry:`, etc.
          }
        }
      }

      // Stream ended normally (server closed)
      setIsConnected(false);
    } catch (err: any) {
      // Don't treat abort as an error
      if (err?.name === 'AbortError') {
        setIsConnected(false);
        return;
      }

      setIsConnected(false);
      const message = err?.message || 'SSE connection error';
      setError(message);

      if (env.ENABLE_DEBUG_LOGGING) {
        console.error('[SSE] Error:', message);
      }

      // Reconnect with exponential back-off
      if (retriesRef.current < maxRetries) {
        const backoff = retryBaseDelay * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        if (env.ENABLE_DEBUG_LOGGING) {
          console.info(`[SSE] Reconnecting in ${backoff}ms (attempt ${retriesRef.current}/${maxRetries})`);
        }
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, backoff);
          // If we get aborted during the wait, clear the timer
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve();
          });
        });
        // Only reconnect if not aborted
        if (!controller.signal.aborted) {
          connect();
        }
      }
    }
  }, [path, maxRetries, retryBaseDelay]);

  useEffect(() => {
    // Abort any existing connection
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!enabled || !path) {
      setIsConnected(false);
      setData(null);
      setError(null);
      return;
    }

    retriesRef.current = 0;

    if (delay > 0) {
      const timer = setTimeout(() => {
        connect();
      }, delay);
      return () => {
        clearTimeout(timer);
        if (abortRef.current) {
          abortRef.current.abort();
          abortRef.current = null;
        }
      };
    } else {
      connect();
    }

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [path, enabled, delay, connect]);

  return { data, isConnected, error };
}
