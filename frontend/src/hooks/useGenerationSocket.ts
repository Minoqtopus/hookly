import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface GenerationStagePayload {
  stage: 'analyzing' | 'generating' | 'optimizing' | 'saving' | 'completed';
  message: string;
  progress: number;
  estimatedTimeRemaining?: number;
}

export interface ContentChunkPayload {
  section: 'title' | 'hook' | 'script' | 'cta';
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
  joinGeneration: (generationId: string, userId: string) => void;
  cancelGeneration: (generationId: string) => void;
  currentStage: GenerationStagePayload | null;
  streamedContent: {
    title: string;
    hook: string;
    script: string;
  };
  disconnect: () => void;
}

export function useGenerationSocket(events?: GenerationEvents): UseGenerationSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStage, setCurrentStage] = useState<GenerationStagePayload | null>(null);
  const [streamedContent, setStreamedContent] = useState({
    title: '',
    hook: '',
    script: ''
  });
  
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/generation`, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true
    });

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected:', socketInstance.id);
      setIsConnected(true);
      eventsRef.current?.onConnected?.();
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      eventsRef.current?.onDisconnected?.();
    });

    // Generation event handlers
    socketInstance.on('connection_status', (data) => {
      console.log('Connection status:', data);
    });

    socketInstance.on('generation_started', (data) => {
      console.log('Generation started:', data);
      setCurrentStage({
        stage: 'analyzing',
        message: 'Generation started...',
        progress: 0
      });
    });

    socketInstance.on('generation_stage', (data) => {
      console.log('Generation stage update:', data);
      const stagePayload: GenerationStagePayload = {
        stage: data.stage,
        message: data.message,
        progress: data.progress,
        estimatedTimeRemaining: data.estimatedTimeRemaining
      };
      setCurrentStage(stagePayload);
      eventsRef.current?.onStageUpdate?.(stagePayload);
    });

    socketInstance.on('content_chunk', (data) => {
      console.log('Content chunk received:', data);
      const chunkPayload: ContentChunkPayload = {
        section: data.section,
        content: data.content,
        isComplete: data.isComplete,
        totalProgress: data.totalProgress
      };
      
      // Update streamed content
      setStreamedContent(prev => ({
        ...prev,
        [data.section]: data.content
      }));
      
      eventsRef.current?.onContentChunk?.(chunkPayload);
    });

    socketInstance.on('generation_completed', (data) => {
      console.log('Generation completed:', data);
      setCurrentStage({
        stage: 'completed',
        message: 'Generation completed successfully!',
        progress: 100
      });
      eventsRef.current?.onCompleted?.(data.generation);
    });

    socketInstance.on('generation_error', (data) => {
      console.error('Generation error:', data);
      eventsRef.current?.onError?.(data.error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinGeneration = useCallback((generationId: string, userId: string) => {
    if (socket) {
      console.log('Joining generation:', generationId, 'for user:', userId);
      socket.emit('join_generation', { generationId, userId });
    }
  }, [socket]);

  const cancelGeneration = useCallback((generationId: string) => {
    if (socket) {
      console.log('Canceling generation:', generationId);
      socket.emit('cancel_generation', { generationId });
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  return {
    isConnected,
    joinGeneration,
    cancelGeneration,
    currentStage,
    streamedContent,
    disconnect
  };
}