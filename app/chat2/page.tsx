'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Video, Send } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSession } from 'next-auth/react';
import { fetchRoomMessages } from '@/lib/api-messages';

interface MessageData {
    message: string;
    userName: string;
    userImage: string;
    userId: string;
}

// Generate or retrieve anonymous user ID
const getOrCreateUserId = () => {
    if (typeof window === 'undefined') return '';

    let userId = localStorage.getItem('anonymousUserId');
    if (!userId) {
        userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anonymousUserId', userId);
    }
    return userId;
};

export default function Chat2Page() {
    const { data: session } = useSession();
    const [currentUserId, setCurrentUserId] = useState('');
    const [isClientReady, setIsClientReady] = useState(false);

    useEffect(() => {
        // Set user ID on client side
        const userId = getOrCreateUserId();
        setCurrentUserId(userId);
        setIsClientReady(true);
        console.log('Current user ID:', userId);
    }, []);

    const user = {
        name: session?.user?.name || 'Anonymous',
        image: session?.user?.image || 'https://avatar.iran.liara.run/public/43',
        id: session?.user?.id || currentUserId,
    };

    const { sendMessage, messages, joinRoom, leaveRoom } = useSocket();
    const [message, setMessage] = useState('');
    const [roomMessages, setRoomMessages] = useState<MessageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const room = 'room2';

    // Fetch messages from database on component mount
    useEffect(() => {
        const loadMessages = async () => {
            setIsLoading(true);
            const data = await fetchRoomMessages(room);
            if (data.success) {
                setRoomMessages(data.messages);
                console.log(`Loaded ${data.count} messages from database for ${room}`);
            }
            setIsLoading(false);
        };

        // Only load messages after client is ready with userId
        if (isClientReady) {
            loadMessages();
        }
    }, [room, isClientReady]);

    useEffect(() => {
        joinRoom(room);
        return () => {
            leaveRoom(room);
        };
    }, [joinRoom, leaveRoom]);

    // Sync messages from context to local state (for real-time updates)
    useEffect(() => {
        if (messages[room]) {
            setRoomMessages(prevMessages => {
                // Merge database messages with new socket messages
                const existingIds = new Set(prevMessages.map((_, idx) => idx));
                return [...prevMessages, ...messages[room].filter((_, idx) => !existingIds.has(idx))];
            });
            console.log(`Room 2 messages updated:`, messages[room]);
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim() && user.id) {
            sendMessage(message, room, user.name, user.image, user.id);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="border-b bg-white shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                        <div>
                            <h2 className="font-semibold text-lg">{user.name} - Room 2</h2>
                            <p className="text-sm text-gray-500">Online</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Video className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {isLoading ? (
                    <div className="text-center text-gray-400 mt-4">Loading messages...</div>
                ) : roomMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-4">No messages yet. Start chatting!</div>
                ) : (
                    roomMessages.map((msg, index) => {
                        const isOwnMessage = msg.userId === user.id;
                        const imageSrc = msg.userImage || 'https://avatar.iran.liara.run/public/1';
                        return (
                            <div key={index} className={`mb-4 flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Image
                                    src={imageSrc}
                                    alt={msg.userName || 'User'}
                                    width={32}
                                    height={32}
                                    className="rounded-full flex-shrink-0"
                                />
                                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{msg.userName || 'Anonymous'}</span>
                                    </div>
                                    <div className={`inline-block p-3 rounded-lg shadow break-words ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t bg-white p-4">
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="icon" className="rounded-full" onClick={handleSendMessage}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
