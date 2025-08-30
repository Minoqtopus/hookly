/**
 * Generation WebSocket Gateway
 * 
 * Handles real-time streaming communication for AI content generation.
 * Provides live updates during the generation process including:
 * - Generation stages (analyzing, generating, optimizing)
 * - Real-time content streaming with chunked responses
 * - Progress indicators and connection management
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Generation events for real-time streaming
export enum GenerationEvents {
  // Client to server
  JOIN_GENERATION = 'join_generation',
  CANCEL_GENERATION = 'cancel_generation',
  
  // Server to client  
  GENERATION_STARTED = 'generation_started',
  GENERATION_STAGE = 'generation_stage',
  CONTENT_CHUNK = 'content_chunk',
  GENERATION_COMPLETED = 'generation_completed',
  GENERATION_ERROR = 'generation_error',
  CONNECTION_STATUS = 'connection_status',
}

export interface GenerationStagePayload {
  stage: 'analyzing' | 'generating' | 'optimizing' | 'saving' | 'completed';
  message: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

export interface ContentChunkPayload {
  section: 'title' | 'hook' | 'script' | 'cta';
  content: string;
  isComplete: boolean;
  totalProgress: number; // 0-100
}

export interface GenerationSessionPayload {
  generationId: string;
  userId: string;
  platform: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/generation',
})
export class GenerationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GenerationGateway.name);
  private readonly activeGenerations = new Map<string, string>(); // socketId -> generationId
  private readonly generationSockets = new Map<string, Set<string>>(); // generationId -> socketIds

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);
      
      // Send connection confirmation
      client.emit(GenerationEvents.CONNECTION_STATUS, {
        status: 'connected',
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Connection error for ${client.id}:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up active generation tracking
    const generationId = this.activeGenerations.get(client.id);
    if (generationId) {
      this.removeClientFromGeneration(client.id, generationId);
    }
  }

  @SubscribeMessage(GenerationEvents.JOIN_GENERATION)
  async handleJoinGeneration(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { generationId: string; userId: string },
  ) {
    const { generationId, userId } = payload;
    
    this.logger.log(`🔗 Client ${client.id} joining generation ${generationId} for user ${userId}`);
    
    // Add client to generation tracking
    this.activeGenerations.set(client.id, generationId);
    
    if (!this.generationSockets.has(generationId)) {
      this.generationSockets.set(generationId, new Set());
    }
    this.generationSockets.get(generationId)!.add(client.id);
    
    // Join client to generation room for targeted broadcasting
    await client.join(`generation:${generationId}`);
    this.logger.log(`🏠 Client ${client.id} joined room generation:${generationId}`);
    
    client.emit(GenerationEvents.GENERATION_STARTED, {
      generationId,
      message: 'Connected to generation stream',
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`📡 Sent GENERATION_STARTED event to ${client.id}`);
  }

  @SubscribeMessage(GenerationEvents.CANCEL_GENERATION)
  async handleCancelGeneration(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { generationId: string },
  ) {
    const { generationId } = payload;
    this.logger.log(`Client ${client.id} canceling generation ${generationId}`);
    
    // TODO: Implement generation cancellation logic
    // This would need to integrate with the AI service to stop generation
    
    client.emit(GenerationEvents.GENERATION_ERROR, {
      generationId,
      error: 'Generation cancelled by user',
      timestamp: new Date().toISOString(),
    });
  }

  // Methods for external services to emit events

  /**
   * Emit generation stage update to all clients watching this generation
   */
  emitGenerationStage(generationId: string, payload: GenerationStagePayload) {
    const clientCount = this.getActiveClientCount(generationId);
    this.logger.log(`📡 Emitting GENERATION_STAGE to ${clientCount} clients for ${generationId}: ${payload.stage} (${payload.progress}%)`);
    
    this.server.to(`generation:${generationId}`).emit(GenerationEvents.GENERATION_STAGE, {
      generationId,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit content chunk for real-time streaming
   */
  emitContentChunk(generationId: string, payload: ContentChunkPayload) {
    const clientCount = this.getActiveClientCount(generationId);
    this.logger.log(`🎯 Emitting CONTENT_CHUNK to ${clientCount} clients for ${generationId}: ${payload.section} (${payload.content.length} chars)`);
    
    this.server.to(`generation:${generationId}`).emit(GenerationEvents.CONTENT_CHUNK, {
      generationId,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit generation completion
   */
  emitGenerationCompleted(generationId: string, generation: any) {
    this.server.to(`generation:${generationId}`).emit(GenerationEvents.GENERATION_COMPLETED, {
      generationId,
      generation,
      message: 'Generation completed successfully!',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit generation error
   */
  emitGenerationError(generationId: string, error: string) {
    this.server.to(`generation:${generationId}`).emit(GenerationEvents.GENERATION_ERROR, {
      generationId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  private removeClientFromGeneration(socketId: string, generationId: string) {
    this.activeGenerations.delete(socketId);
    
    const sockets = this.generationSockets.get(generationId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.generationSockets.delete(generationId);
      }
    }
  }

  /**
   * Get active client count for a generation
   */
  getActiveClientCount(generationId: string): number {
    return this.generationSockets.get(generationId)?.size || 0;
  }
}