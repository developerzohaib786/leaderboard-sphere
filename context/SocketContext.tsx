'use client';

import React, { useCallback, useState, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
    children?: React.ReactNode;
}

interface MessageData {
    message: string;
    userName: string;
    userImage: string;
    userId: string;
}

interface iSocketContext {
    sendMessage: (msg: string, room: string, userName: string, userImage: string, userId: string) => any;
    messages: Record<string, MessageData[]>;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    currentRoom: string | null;
}

export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("state is undefined...");
    }
    return state;
}

const SocketContext = React.createContext<iSocketContext | null>(null);

export const SocketProvider: React.FC<SocketContextProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<Record<string, MessageData[]>>({
        room1: [],
        room2: [],
        room3: [],
        room4: [],
    });
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);


    const sendMessage: iSocketContext["sendMessage"] = useCallback((msg: string, room: string, userName: string, userImage: string, userId: string) => {
        console.log('Sending message:', msg, 'to room:', room, 'from:', userName, 'userId:', userId);
        if (socket) {
            socket.emit('event:message', { message: msg, room, userName, userImage, userId });
        }
    }, [socket]);

    const joinRoom = useCallback((room: string) => {
        console.log('Joining room:', room);
        if (socket) {
            socket.emit('join:room', { room });
            setCurrentRoom(room);
        }
    }, [socket]);

    const leaveRoom = useCallback((room: string) => {
        console.log('Leaving room:', room);
        if (socket) {
            socket.emit('leave:room', { room });
            setCurrentRoom(null);
        }
    }, [socket]);


    const onMessageReceived = useCallback((msg: string) => {
        console.log('Message received from server:', msg);
        const { message, room, userName, userImage, userId } = JSON.parse(msg) as { message: string, room: string, userName: string, userImage: string, userId: string };
        setMessages((prevMessages) => ({
            ...prevMessages,
            [room]: [...(prevMessages[room] || []), { message, userName, userImage, userId }]
        }));
    }, []);

    useEffect(() => {
        const _socket = io('http://localhost:3001');
        _socket.on('message', onMessageReceived);

        _socket.on('room:joined', ({ room }: { room: string }) => {
            console.log('Successfully joined room:', room);
        });

        _socket.on('room:error', ({ message }: { message: string }) => {
            console.error('Room error:', message);
        });

        setSocket(_socket);
        return () => {
            _socket.disconnect();
            _socket.off('message', onMessageReceived);
            setSocket(undefined);
        }

    }, [onMessageReceived]);

    return (
        <SocketContext.Provider value={{ sendMessage, messages, joinRoom, leaveRoom, currentRoom }}>
            {children}
        </SocketContext.Provider>
    );
}