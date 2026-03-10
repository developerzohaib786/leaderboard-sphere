'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { fetchLastMessage } from '@/lib/api-messages';
import { MessageSquare, Github, Users, Monitor } from 'lucide-react';

// Import room images
import GeneralImg from '@/public/discussion.jpg';
import GithubImg from '@/public/github.png';

interface LastMessage {
    id?: string;
    message: string;
    userName: string;
    userImage: string;
    userId: string;
    createdAt?: string;
}

interface RoomInfo {
    id: string;
    roomId: string;
    title: string;
    href: string;
    icon: React.ReactNode;
    color: string;
    lastMessage: LastMessage | null;
}

const defaultRooms: Omit<RoomInfo, 'lastMessage'>[] = [
    {
        id: 'general-room',
        roomId: 'room1',
        title: 'General Room',
        href: '/chat-community/general-room',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'from-lime-400 to-green-500',
    },
    {
        id: 'github-issues-room',
        roomId: 'room2',
        title: 'GitHub Issues',
        href: '/chat-community/github-issues-room',
        icon: <Github className="w-5 h-5" />,
        color: 'from-purple-400 to-pink-500',
    },
    {
        id: 'project-showcase-room',
        roomId: 'room3',
        title: 'Project Showcase',
        href: '/chat-community/project-showcase-room',
        icon: <Monitor className="w-5 h-5" />,
        color: 'from-orange-400 to-red-500',
    },
    {
        id: 'gsoc-org-discussion-room',
        roomId: 'room4',
        title: 'GSOC Discussion',
        href: '/chat-community/gsoc-org-discussion-room',
        icon: <Users className="w-5 h-5" />,
        color: 'from-blue-400 to-cyan-500',
    },
];

const lastMessagesCache: Record<string, LastMessage | null> = {};

const getInitialRooms = (): RoomInfo[] => {
    return defaultRooms.map(room => ({
        ...room,
        lastMessage: lastMessagesCache[room.roomId] || null,
    }));
};

export default function ChatSidebar() {
    const pathname = usePathname();
    const { messages } = useSocket();
    const [rooms, setRooms] = useState<RoomInfo[]>(getInitialRooms);

    useEffect(() => {
        const loadLastMessages = async () => {
            const results = await Promise.all(
                defaultRooms.map(async (room) => {
                    const result = await fetchLastMessage(room.roomId);
                    return {
                        roomId: room.roomId,
                        lastMessage: result.success && result.message ? result.message : null,
                    };
                })
            );
            
            setRooms(prevRooms =>
                prevRooms.map(room => {
                    const fetchedRoom = results.find(r => r.roomId === room.roomId);
                    if (fetchedRoom?.lastMessage) {
                        lastMessagesCache[room.roomId] = fetchedRoom.lastMessage;
                        return { ...room, lastMessage: fetchedRoom.lastMessage };
                    }
                    return room;
                })
            );
        };

        loadLastMessages();
    }, []);

    useEffect(() => {
        setRooms(prevRooms =>
            prevRooms.map(room => {
                const roomMessages = messages[room.roomId];
                if (roomMessages && roomMessages.length > 0) {
                    const lastSocketMessage = roomMessages[roomMessages.length - 1];
                    const newLastMessage = {
                        id: lastSocketMessage.id,
                        message: lastSocketMessage.message,
                        userName: lastSocketMessage.userName,
                        userImage: lastSocketMessage.userImage,
                        userId: lastSocketMessage.userId,
                        createdAt: lastSocketMessage.createdAt,
                    };
                    lastMessagesCache[room.roomId] = newLastMessage;
                    return {
                        ...room,
                        lastMessage: newLastMessage,
                    };
                }
                return room;
            })
        );
    }, [messages]);

    const truncateMessage = (message: string, maxLength: number = 30) => {
        if (!message) return '';
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                 <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-codesandbox text-lime-400 h-9 w-auto"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                  <line x1={12} y1={22.08} x2={12} y2={12} />
                </svg>
              </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Chat Rooms</h2>
                    <p className="text-sm text-gray-400">Select a room to start chatting</p>
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto">
                {rooms.map((room) => {
                    const isActive = pathname === room.href;
                    return (
                        <Link key={room.id} href={room.href}>
                            <div
                                className={`flex items-center gap-3 p-4 hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-800/50 ${
                                    isActive ? 'bg-gray-800 border-l-4 border-l-lime-500' : ''
                                }`}
                            >
                                {/* Room Icon */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${room.color} flex items-center justify-center text-white`}
                                >
                                    {room.icon}
                                </div>

                                {/* Room Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className={`font-semibold truncate ${
                                                isActive ? 'text-lime-400' : 'text-gray-200'
                                            }`}
                                        >
                                            {room.title}
                                        </h3>
                                        {room.lastMessage?.createdAt && (
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                {formatTime(room.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {room.lastMessage ? (
                                            <p className="text-sm text-gray-400 truncate">
                                                <span className="font-medium text-gray-300">
                                                    {room.lastMessage.userName}:
                                                </span>{' '}
                                                {truncateMessage(room.lastMessage.message)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">
                                                No messages yet
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <Link href="/chat-community">
                    <div className="text-center text-sm text-gray-400 hover:text-lime-400 cursor-pointer transition-colors">
                        ← Back to Community
                    </div>
                </Link>
            </div>
        </div>
    );
}