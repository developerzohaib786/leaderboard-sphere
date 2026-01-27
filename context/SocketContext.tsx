'use client';

import React, { useCallback, useState, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
    children?: React.ReactNode;
}

interface MessageData {
    id?: string;
    message: string;
    userName: string;
    userImage: string;
    userId: string;
    imageUrl?: string;
    videoUrl?: string;
    rawFileUrl?: string;
    replyToId?: string;
    replyToText?: string;
    createdAt?: string;
}

interface iSocketContext {
    sendMessage: (msg: string, room: string, userName: string, userImage: string, userId: string, imageUrl?: string, videoUrl?: string, rawFileUrl?: string, replyToId?: string, replyToText?: string) => any;
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


    const sendMessage: iSocketContext["sendMessage"] = useCallback((msg: string, room: string, userName: string, userImage: string, userId: string, imageUrl?: string, videoUrl?: string, rawFileUrl?: string, replyToId?: string, replyToText?: string) => {
        console.log('Sending message:', msg, 'to room:', room, 'from:', userName, 'userId:', userId);
        if (socket) {
            socket.emit('event:message', { message: msg, room, userName, userImage, userId, imageUrl, videoUrl, rawFileUrl, replyToId, replyToText });
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
        const { message, room, userName, userImage, userId, imageUrl, videoUrl, rawFileUrl, replyToId, replyToText } = JSON.parse(msg) as MessageData & { room: string };
        setMessages((prevMessages) => ({
            ...prevMessages,
            [room]: [...(prevMessages[room] || []), { message, userName, userImage, userId, imageUrl, videoUrl, rawFileUrl, replyToId, replyToText }]
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