'use client';

import React, { useCallback } from 'react';

interface SocketContextProps {
    children?: React.ReactNode;
}

interface iSocketContext{
    sendMessage: (msg: string) => any;
}

const SocketContext = React.createContext<iSocketContext | null>(null);

export const SocketProvider:React.FC<SocketContextProps> = ({ children }) => {

    const sendMessage:iSocketContext["sendMessage"] = useCallback((msg: string) => {
        console.log('Sending message:', msg);
    }, []);

    return (
        <SocketContext.Provider value={{ sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
}