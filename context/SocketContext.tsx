'use client';

import React, { useCallback, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

interface SocketContextProps {
    children?: React.ReactNode;
}

interface iSocketContext {
    sendMessage: (msg: string) => any;
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

    const sendMessage: iSocketContext["sendMessage"] = useCallback((msg: string) => {
        console.log('Sending message:', msg);
    }, []);



    useEffect(() => {
        const _socket = io('http://localhost:3001');

        return () => {
            _socket.disconnect();
        }

    }, []);

    return (
        <SocketContext.Provider value={{ sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
}