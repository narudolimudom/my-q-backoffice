import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user: { id: string; email: string };
}
