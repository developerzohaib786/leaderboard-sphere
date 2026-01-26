'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Video, Send, Paperclip, X, Reply, FileText, Film, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSession } from 'next-auth/react';
import { fetchRoomMessages } from '@/lib/api-messages';
import defaultUserImg from '@/public/default-image.png';
import GeneralImg from '@/public/discussion.jpg';
import { uploadFile } from '@/lib/cloudinary';

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

export default function ChatPage() {
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
        image: session?.user?.image || defaultUserImg.src,
        id: session?.user?.id || currentUserId,
    };

    const { sendMessage, messages, joinRoom, leaveRoom } = useSocket();
    const [message, setMessage] = useState('');
    const [roomMessages, setRoomMessages] = useState<MessageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const room = 'room1';

    // File upload states
    const [imageUrl, setImageUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [rawFileUrl, setRawFileUrl] = useState<string>('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reply states
    const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);

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
        if (messages[room] && messages[room].length > 0) {
            setRoomMessages(prevMessages => {
                // Simply append new socket messages to existing database messages
                const newMessages = messages[room];
                return [...prevMessages, ...newMessages];
            });
            console.log(`Room 1 messages updated:`, messages[room]);
        }
    }, [messages, room]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        setUploadProgress(`Uploading ${file.name}...`);

        try {
            const result = await uploadFile(file);

            if (result.success) {
                // Determine file type and set appropriate URL
                if (result.resourceType === 'image') {
                    setImageUrl(result.url);
                    setUploadProgress('Image uploaded!');
                } else if (result.resourceType === 'video') {
                    setVideoUrl(result.url);
                    setUploadProgress('Video uploaded!');
                } else {
                    setRawFileUrl(result.url);
                    setUploadProgress('File uploaded!');
                }
            } else {
                setUploadProgress('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress('Upload failed');
        } finally {
            setUploadingFile(false);
            setTimeout(() => setUploadProgress(''), 3000);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const clearFile = (type: 'image' | 'video' | 'raw') => {
        if (type === 'image') setImageUrl('');
        else if (type === 'video') setVideoUrl('');
        else setRawFileUrl('');
    };

    const handleSendMessage = () => {
        if ((message.trim() || imageUrl || videoUrl || rawFileUrl) && user.id) {
            sendMessage(
                message || '(sent a file)',
                room,
                user.name,
                user.image,
                user.id,
                imageUrl || undefined,
                videoUrl || undefined,
                rawFileUrl || undefined,
                replyingTo?.id || undefined,
                replyingTo?.message || undefined
            );
            setMessage('');
            setImageUrl('');
            setVideoUrl('');
            setRawFileUrl('');
            setReplyingTo(null);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="border-b bg-white shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src={GeneralImg}
                            alt="General Room"
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                        <div>
                            <h2 className="font-semibold text-lg">General Room</h2>
                            <p className="text-sm text-gray-500">A place for general discussions and community chat.</p>
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

                        // Debug logging for first few messages
                        if (index < 3) {
                            console.log(`Message ${index} - userId: ${msg.userId}, currentUserId: ${user.id}, match: ${isOwnMessage}`);
                        }

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
                                    <div className={`inline-block rounded-lg shadow overflow-hidden ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                                        {/* Reply preview */}
                                        {msg.replyToText && (
                                            <div className={`text-xs px-3 pt-3 pb-2 border-b ${isOwnMessage ? 'border-blue-400' : 'border-gray-300'}`}>
                                                <Reply className="inline w-3 h-3 mr-1" />
                                                <span className="opacity-75">{msg.replyToText}</span>
                                            </div>
                                        )}

                                        {/* Image - display at top */}
                                        {msg.imageUrl && (
                                            <div className="w-full">
                                                <Image
                                                    src={msg.imageUrl}
                                                    alt="Shared image"
                                                    width={400}
                                                    height={300}
                                                    className="w-full h-auto max-w-md object-cover"
                                                    style={{ maxHeight: '400px' }}
                                                />
                                            </div>
                                        )}

                                        {/* Video - display at top */}
                                        {msg.videoUrl && (
                                            <div className="w-full">
                                                <video
                                                    src={msg.videoUrl}
                                                    controls
                                                    className="w-full max-w-md"
                                                    style={{ maxHeight: '400px' }}
                                                />
                                            </div>
                                        )}

                                        {/* Raw file - display at top */}
                                        {msg.rawFileUrl && (
                                            <div className={`px-3 py-2 ${msg.message ? 'border-b' : ''} ${isOwnMessage ? 'bg-blue-600 border-blue-400' : 'bg-gray-50 border-gray-200'}`}>
                                                <a
                                                    href={msg.rawFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 ${isOwnMessage ? 'text-white' : 'text-blue-600'}`}
                                                >
                                                    <FileText className="w-5 h-5" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">Document</div>
                                                        <div className="text-xs opacity-75">Click to view</div>
                                                    </div>
                                                </a>
                                            </div>
                                        )}

                                        {/* Message text - display below media */}
                                        {msg.message && msg.message !== '(sent a file)' && (
                                            <div className="p-3 break-words">
                                                {msg.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reply button */}
                                    <button
                                        onClick={() => setReplyingTo(msg)}
                                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
                                    >
                                        <Reply className="w-3 h-3" />
                                        Reply
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t bg-white p-4">
                {/* Reply preview */}
                {replyingTo && (
                    <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Reply className="w-4 h-4" />
                            <span className="font-medium">{replyingTo.userName}:</span>
                            <span className="text-gray-600 truncate max-w-xs">{replyingTo.message}</span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-gray-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* File preview section */}
                <div className="flex gap-2 mb-2 flex-wrap">
                    {imageUrl && (
                        <div className="relative group">
                            <Image src={imageUrl} alt="Preview" width={80} height={80} className="rounded-lg border" />
                            <button
                                onClick={() => clearFile('image')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {videoUrl && (
                        <div className="relative group flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border">
                            <Film className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-600">Video ready</span>
                            <button
                                onClick={() => clearFile('video')}
                                className="ml-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {rawFileUrl && (
                        <div className="relative group flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-600">File ready</span>
                            <button
                                onClick={() => clearFile('raw')}
                                className="ml-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Upload progress */}
                {uploadProgress && (
                    <div className="mb-2 text-sm text-gray-600">
                        {uploadProgress}
                    </div>
                )}

                {/* Input area */}
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="rounded-full"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <Button size="icon" className="rounded-full" onClick={handleSendMessage} disabled={uploadingFile}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}