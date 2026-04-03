import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'; // Note: Requires npm i socket.io @nestjs/platform-socket.io @nestjs/websockets

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('joinEvent')
    handleJoinEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const eventId = typeof data === 'string' ? data : data?.eventId;
        console.log(`[Socket] Client ${client.id} attempting to join event: ${eventId}`);
        if (eventId) {
            client.join(eventId);
            console.log(`[Socket] Client ${client.id} joined room: ${eventId}`);
            return { event: 'joined', data: `Joined event: ${eventId}` };
        }
    }

    @SubscribeMessage('newMedia')
    handleNewMedia(@MessageBody() data: any) {
        const eventId = data?.eventId;
        if (eventId) {
            this.server.to(eventId).emit('mediaAdded', data);
            return { event: 'mediaAdded', data };
        }
    }
}
