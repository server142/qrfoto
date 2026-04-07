import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'; // Note: Requires npm i socket.io @nestjs/platform-socket.io @nestjs/websockets

interface ActiveGuest {
    socketId: string;
    eventId: string;
    deviceId: string;
    name: string;
    joinedAt: Date;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Track active devices (socket id -> Guest info)
    private activeGuests = new Map<string, ActiveGuest>();

    handleDisconnect(client: Socket) {
        const guest = this.activeGuests.get(client.id);
        if (guest) {
            this.activeGuests.delete(client.id);
            this.broadcastActiveGuests(guest.eventId);
        }
    }

    private broadcastActiveGuests(eventId: string) {
        // Collect all guests for this event
        const guestsInEvent = Array.from(this.activeGuests.values()).filter(g => g.eventId === eventId);
        this.server.to(eventId).emit('activeGuestsSync', guestsInEvent);
    }

    @SubscribeMessage('joinEvent')
    handleJoinEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        // Extract data properly if it's an object, or keep string compat
        const eventId = typeof data === 'string' ? data : data?.eventId;
        const deviceId = data?.deviceId || 'unknown';
        const name = data?.name || 'Invitado';

        console.log(`[Socket] Client ${client.id} joining event: ${eventId} as device: ${deviceId}`);

        if (eventId) {
            client.join(eventId);
            
            // Register guest for radar
            this.activeGuests.set(client.id, {
                socketId: client.id,
                eventId,
                deviceId,
                name,
                joinedAt: new Date()
            });

            // Announce new guest list
            this.broadcastActiveGuests(eventId);

            return { event: 'joined', data: `Joined event: ${eventId}` };
        }
    }

    @SubscribeMessage('blockGuest')
    handleBlockGuest(@MessageBody() data: { eventId: string, deviceId: string }) {
        if (data && data.eventId && data.deviceId) {
            // Emits an event specifically triggering the blackout block screen of a given device
            this.server.to(data.eventId).emit('guestBlocked', { deviceId: data.deviceId });
        }
    }

    @SubscribeMessage('warnGuest')
    handleWarnGuest(@MessageBody() data: { eventId: string, deviceId: string }) {
        if (data && data.eventId && data.deviceId) {
            // Send warning popups
            this.server.to(data.eventId).emit('guestWarned', { deviceId: data.deviceId });
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
