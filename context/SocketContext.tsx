'use client';

import React, { useCallback,useState, useContext, useEffect } from 'react';
import { io,Socket } from 'socket.io-client';

interface SocketContextProps {
    children?: React.ReactNode;
}

interface iSocketContext {
    sendMessage: (msg: string) => any;
    messages: string[];
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
    const [messages, setMessages] = useState<string[]>([]);


    const sendMessage: iSocketContext["sendMessage"] = useCallback((msg: string) => {
        console.log('Sending message:', msg);
        if (socket) {
            socket.emit('event:message', { message: msg } );
        }
    }, [socket]);


    const onMessageReceived = useCallback((msg: string) => {
        console.log('Message received from server:', msg);
        const {message}=JSON.parse(msg) as {message:string};
        setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    useEffect(() => {
        const _socket = io('http://localhost:3001');
        _socket.on('message', onMessageReceived);
        setSocket(_socket);
        return () => {
            _socket.disconnect();
            _socket.off('message', onMessageReceived);
            setSocket(undefined);
        }

    }, []);

    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    );
}