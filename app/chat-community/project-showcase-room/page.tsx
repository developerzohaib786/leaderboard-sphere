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
import ProjectImg from '@/public/project.png';
import { uploadFile } from '@/lib/cloudinary';
import ChatSidebar from '../components/ChatSidebar';


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

const renderMessageText = (text: string, isOwnMessage: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline break-all ${isOwnMessage ? 'text-blue-200 hover:text-white' : 'text-blue-500 hover:text-blue-400'}`}
            >
                {part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

export default function Chat3Page() {
    const { data: session } = useSession();
    const [currentUserId, setCurrentUserId] = useState('');
    const [isClientReady, setIsClientReady] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const room = 'room3';

    // File upload states
    const [imageUrl, setImageUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [rawFileUrl, setRawFileUrl] = useState<string>('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reply states
    const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
    
    // Track how many socket messages we've already processed
    const processedSocketMessagesRef = useRef<number>(0);

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
        // Reset processed count when joining room
        processedSocketMessagesRef.current = 0;
        return () => {
            leaveRoom(room);
        };
    }, [joinRoom, leaveRoom]);

    // Sync messages from context to local state (for real-time updates)
    useEffect(() => {
        const socketMessages = messages[room] || [];
        const alreadyProcessed = processedSocketMessagesRef.current;
        
        // Only process new messages that haven't been added yet
        if (socketMessages.length > alreadyProcessed) {
            const newMessages = socketMessages.slice(alreadyProcessed);
            setRoomMessages(prevMessages => [...prevMessages, ...newMessages]);
            processedSocketMessagesRef.current = socketMessages.length;
            console.log(`Added ${newMessages.length} new socket messages to room3`);
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
        if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
}
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

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = textareaRef.current;
    if (el) {
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
};
    

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100">
            <ChatSidebar />
            <div className="flex flex-col flex-1 h-screen">
                {/* Header */}
                <div className="border-b border-gray-800 bg-gray-900 shadow-md">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src={ProjectImg}
                                alt="Project Showcase Room"
                                width={48}
                                height={48}
                                className="rounded-full border border-gray-700"
                            />
                            <div>
                                <h2 className="font-semibold text-lg text-white">Project Showcase Room</h2>
                                <p className="text-sm text-gray-400">Showcase your projects and get feedback from the community.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-white hover:bg-gray-800">
                                <Phone className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-white hover:bg-gray-800">
                                <Video className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-950 scrollbar-thin scrollbar-thumb-gray-800">
                    {isLoading ? (
                        <div className="text-center text-gray-500 mt-4 italic">Loading messages...</div>
                    ) : roomMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-4 italic">No messages yet. Start chatting!</div>
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
                                        className="rounded-full flex-shrink-0 border border-gray-800"
                                    />
                                    <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-xs text-gray-400">{msg.userName || 'Anonymous'}</span>
                                        </div>
                                        <div className={`inline-block rounded-2xl shadow-lg overflow-hidden ${isOwnMessage ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'}`}>
                                            {/* Reply preview */}
                                            {msg.replyToText && (
                                                <div className={`text-xs px-3 pt-3 pb-2 border-b ${isOwnMessage ? 'border-blue-500 bg-blue-700/30' : 'border-gray-700 bg-gray-900/50'}`}>
                                                    <Reply className="inline w-3 h-3 mr-1" />
                                                    <span className="opacity-70 italic">{msg.replyToText}</span>
                                                </div>
                                            )}

                                            {/* Media Content */}
                                            {msg.imageUrl && (
                                                <div className="w-full">
                                                    <Image src={msg.imageUrl} alt="Shared" width={400} height={300} className="w-full h-auto max-w-md object-cover" style={{ maxHeight: '400px' }} />
                                                </div>
                                            )}
                                            {msg.videoUrl && (
                                                <div className="w-full">
                                                    <video src={msg.videoUrl} controls className="w-full max-w-md bg-black" style={{ maxHeight: '400px' }} />
                                                </div>
                                            )}
                                            {msg.rawFileUrl && (
                                                <div className={`px-4 py-3 ${msg.message ? 'border-b' : ''} ${isOwnMessage ? 'bg-blue-700 border-blue-500' : 'bg-gray-900 border-gray-700'}`}>
                                                    <a href={msg.rawFileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${isOwnMessage ? 'text-white' : 'text-blue-400'}`}>
                                                        <FileText className="w-5 h-5" />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">Document</div>
                                                            <div className="text-[10px] opacity-60">Click to view</div>
                                                        </div>
                                                    </a>
                                                </div>
                                            )}

                                            {/* Text Content */}
                                            {msg.message && msg.message !== '(sent a file)' && (
                                                <div className="p-3 px-4 break-words whitespace-pre-wrap text-sm leading-relaxed">
                                                    {renderMessageText(msg.message, isOwnMessage)}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setReplyingTo(msg)}
                                            className="text-[10px] text-gray-500 hover:text-gray-300 mt-1 flex items-center gap-1 transition-colors px-1"
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

                {/* Input Area */}
                <div className="border-t border-gray-800 bg-gray-900 p-4">
                    {/* Reply Preview */}
                    {replyingTo && (
                        <div className="mb-2 p-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-1">
                            <div className="flex items-center gap-2 text-xs">
                                <Reply className="w-4 h-4 text-blue-400" />
                                <span className="font-medium text-gray-300">{replyingTo.userName}:</span>
                                <span className="text-gray-500 truncate max-w-xs">{replyingTo.message}</span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* File Previews */}
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {imageUrl && (
                            <div className="relative group">
                                <Image src={imageUrl} alt="Preview" width={80} height={80} className="rounded-lg border border-gray-700" />
                                <button onClick={() => clearFile('image')} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><X className="w-3 h-3" /></button>
                            </div>
                        )}
                        {videoUrl && (
                            <div className="relative group flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                                <Film className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-300">Video ready</span>
                                <button onClick={() => clearFile('video')} className="ml-2 bg-red-600 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                            </div>
                        )}
                        {rawFileUrl && (
                            <div className="relative group flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-300">File ready</span>
                                <button onClick={() => clearFile('raw')} className="ml-2 bg-red-600 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                            </div>
                        )}
                    </div>

                    {uploadProgress && <div className="mb-2 text-xs text-blue-500 animate-pulse">{uploadProgress}</div>}

                    <div className="flex items-end gap-2">
                        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx" />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="rounded-full text-gray-400 hover:text-white hover:bg-gray-800 mb-1"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="Type a message..."
                            className="flex-1 resize-none overflow-hidden rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white ring-offset-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-600"
                            style={{ minHeight: '44px', maxHeight: '150px' }}
                            value={message}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                        />
                        <Button 
                            size="icon" 
                            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white mb-1 h-10 w-10 shadow-lg transition-transform active:scale-95" 
                            onClick={handleSendMessage} 
                            disabled={uploadingFile}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
