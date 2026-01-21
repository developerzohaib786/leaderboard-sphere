'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Video, Send } from 'lucide-react';
import Image from 'next/image';
import {useState} from 'react';                             
import { useSocket } from '@/context/SocketContext';

export default function ChatPage() {
    const user = {
        name: 'John Doe',
        image: 'https://avatar.iran.liara.run/public/42',
    };

    const {sendMessage, messages} = useSocket();
    const [message, setMessage] = useState('');

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
                            <h2 className="font-semibold text-lg">{user.name}</h2>
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
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        <div className="inline-block bg-white p-2 rounded shadow">
                            {msg}
                        </div>
                    </div>
                ))} 
            </div>

            <div className="border-t bg-white p-4">
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1"
                        onChange={(e)=>setMessage(e.target.value)}
                    />
                    <Button size="icon" className="rounded-full" onClick={() => sendMessage(message)}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}