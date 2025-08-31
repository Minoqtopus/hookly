import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { TokenService } from "@/shared/services/token-service";

export interface GenerationStagePayload {
  stage: "analyzing" | "generating" | "optimizing" | "saving" | "completed";
  message: string;
  progress: number;
  estimatedTimeRemaining?: number;
}

export interface ContentChunkPayload {
  section: "title" | "hook" | "script" | "cta";
  content: string;
  isComplete: boolean;
  totalProgress: number;
}

export interface GenerationEvents {
  onStageUpdate?: (payload: GenerationStagePayload) => void;
  onContentChunk?: (payload: ContentChunkPayload) => void;
  onCompleted?: (generation: any) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export interface UseGenerationSocketReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  joinGeneration: (generationId: string) => void;
  cancelGeneration: (generationId: string) => void;
  currentStage: GenerationStagePayload | null;
  streamedContent: {
    title: string;
    hook: string;
    script: string;
  };
  clearContent: () => void;
  disconnect: () => void;
}

export function useGenerationSocket(
  events?: GenerationEvents
): UseGenerationSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStage, setCurrentStage] =
    useState<GenerationStagePayload | null>(null);
  const [streamedContent, setStreamedContent] = useState({
    title: "",
    hook: "",
    script: "",
  });

  // Enterprise-grade connection management
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const maxRetries = 5;
  const baseRetryDelay = 1000; // 1 second, exponential backoff

  const eventsRef = useRef(events);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  eventsRef.current = events;

  // Enterprise-grade connection establishment
  const createConnection = useCallback(() => {
    const tokenService = new TokenService();
    const accessToken = tokenService.getAccessToken();

    if (!accessToken) {
      console.error("🔐 No access token available for WebSocket connection");
      return null;
    }

    // Validate token format before attempting connection
    if (!tokenService.isValidTokenFormat(accessToken)) {
      console.error(
        "🔐 Invalid token format, cannot establish WebSocket connection"
      );
      return null;
    }

    console.log("🔌 Establishing WebSocket connection...");

    // Create socket with production-ready configuration
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const socketUrl = apiUrl.replace(/^http/, "ws").replace(/^https/, "wss");

    const socketInstance = io(`${apiUrl}/generation`, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
      autoConnect: true,
      reconnection: false, // We'll handle reconnection manually
      timeout: 20000, // Increased timeout for production
      forceNew: true, // Force new connection to prevent stale connections
      upgrade: true, // Allow protocol upgrades
      rememberUpgrade: true, // Remember successful upgrades
      query: {
        token: accessToken,
        clientId: `client_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`,
      },
    });

    return socketInstance;
  }, []);

  // Automatic reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (connectionAttempts >= maxRetries) {
      console.error("🚫 Max reconnection attempts reached, giving up");
      setIsReconnecting(false);
      eventsRef.current?.onError?.(
        "Connection failed after maximum retry attempts"
      );
      return;
    }

    const delay = baseRetryDelay * Math.pow(2, connectionAttempts); // Exponential backoff
    console.log(
      `⏳ Scheduling reconnection attempt ${
        connectionAttempts + 1
      } in ${delay}ms...`
    );

    setIsReconnecting(true);
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionAttempts((prev) => prev + 1);
      initializeConnection();
    }, delay);
  }, [connectionAttempts, maxRetries, baseRetryDelay]);

  // Health check mechanism
  const startHealthCheck = useCallback(
    (socketInstance: Socket) => {
      healthCheckIntervalRef.current = setInterval(() => {
        if (socketInstance.connected) {
          socketInstance.emit("ping", { timestamp: Date.now() });
        } else {
          console.warn(
            "⚠️ Socket disconnected during health check, attempting reconnection"
          );
          scheduleReconnect();
        }
      }, 30000); // Health check every 30 seconds
    },
    [scheduleReconnect]
  );

  // Initialize connection with error handling
  const initializeConnection = useCallback(() => {
    const socketInstance = createConnection();
    if (!socketInstance) {
      scheduleReconnect();
      return;
    }

    setSocket(socketInstance);

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Enterprise-grade connection event handlers
    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected successfully:", socketInstance.id);
      setIsConnected(true);
      setConnectionAttempts(0); // Reset retry counter on successful connection
      setIsReconnecting(false);
      startHealthCheck(socketInstance);
      eventsRef.current?.onConnected?.();
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
      console.error("❌ Error details:", error);
      setIsConnected(false);
      eventsRef.current?.onError?.(
        `Connection failed: ${error.message}. Please check your internet connection and try again.`
      );
      scheduleReconnect();
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("🔌 WebSocket disconnected:", reason);
      setIsConnected(false);

      // Clear health check
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }

      eventsRef.current?.onDisconnected?.();

      // Only attempt reconnection for certain disconnect reasons
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "ping timeout"
      ) {
        scheduleReconnect();
      }
    });

    socketInstance.on("error", (error) => {
      console.error("🚨 WebSocket error:", error);
      eventsRef.current?.onError?.(
        typeof error === "string" ? error : "Socket error occurred"
      );
    });

    // Health check response handler
    socketInstance.on("pong", (data) => {
      const latency = Date.now() - data.timestamp;
      if (latency > 5000) {
        // High latency warning
        console.warn(`⚠️ High WebSocket latency detected: ${latency}ms`);
      }
    });

    // Generation-specific event handlers with error boundaries
    socketInstance.on("connection_status", (data) => {
      console.log("📡 Connection status:", data);
    });

    socketInstance.on("generation_started", (data) => {
      console.log("🚀 Generation started:", data);
      setCurrentStage({
        stage: "analyzing",
        message: "Generation started...",
        progress: 0,
      });
    });

    socketInstance.on("generation_stage", (data) => {
      try {
        console.log("📊 Generation stage update:", data);
        const stagePayload: GenerationStagePayload = {
          stage: data.stage,
          message: data.message,
          progress: data.progress,
          estimatedTimeRemaining: data.estimatedTimeRemaining,
        };
        setCurrentStage(stagePayload);
        eventsRef.current?.onStageUpdate?.(stagePayload);
      } catch (error) {
        console.error("Error processing generation stage:", error);
      }
    });

    socketInstance.on("content_chunk", (data) => {
      try {
        console.log("📝 Content chunk received:", data);
        const chunkPayload: ContentChunkPayload = {
          section: data.section,
          content: data.content,
          isComplete: data.isComplete,
          totalProgress: data.totalProgress,
        };

        setStreamedContent((prev) => ({
          ...prev,
          [data.section]: data.content,
        }));

        eventsRef.current?.onContentChunk?.(chunkPayload);
      } catch (error) {
        console.error("Error processing content chunk:", error);
      }
    });

    socketInstance.on("generation_completed", (data) => {
      try {
        console.log("✅ Generation completed:", data);
        setCurrentStage({
          stage: "completed",
          message: "Generation completed successfully!",
          progress: 100,
        });
        eventsRef.current?.onCompleted?.(data);
      } catch (error) {
        console.error("Error processing generation completion:", error);
      }
    });

    socketInstance.on("generation_error", (data) => {
      console.error("❌ Generation error:", data);
      setCurrentStage(null);
      eventsRef.current?.onError?.(data.message || "Generation failed");
    });
  }, [createConnection, scheduleReconnect, startHealthCheck]);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [initializeConnection]);

  // Join generation room and clear previous content
  const joinGeneration = useCallback(
    (generationId: string) => {
      if (socket && socket.connected) {
        console.log("🔗 Joining generation room:", generationId);
        // Clear previous content when joining new generation
        setStreamedContent({ title: "", hook: "", script: "" });
        setCurrentStage(null);
        socket.emit("join_generation", { generationId });
      } else {
        console.warn("⚠️ Cannot join generation - socket not connected");
      }
    },
    [socket]
  );

  // Cancel active generation
  const cancelGeneration = useCallback(
    (generationId: string) => {
      if (socket && socket.connected) {
        console.log("❌ Canceling generation:", generationId);
        socket.emit("cancel_generation", { generationId });
      }
    },
    [socket]
  );

  // Clear all content and reset state
  const clearContent = useCallback(() => {
    setStreamedContent({ title: "", hook: "", script: "" });
    setCurrentStage(null);
  }, []);

  // Gracefully disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
      console.log("🔌 Manually disconnecting WebSocket");
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    // Clear timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
  }, [socket]);

  return {
    isConnected,
    isReconnecting,
    joinGeneration,
    cancelGeneration,
    currentStage,
    streamedContent,
    clearContent,
    disconnect,
  };
}
