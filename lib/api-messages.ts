// API Configuration
export const API_CONFIG = {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    MESSAGES_API: '/api/messages',
};

// Helper function to fetch the last message for a room
export const fetchLastMessage = async (roomId: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.MESSAGES_API}/room/${roomId}/last`);
        const data = await response.json();
        console.log(`Fetched last message for ${roomId}:`, data);

        if (data.success && data.message) {
            return {
                success: true,
                message: {
                    id: data.message.id,
                    message: data.message.text,
                    userName: data.message.userName,
                    userImage: data.message.userImage,
                    userId: data.message.userId,
                    imageUrl: data.message.imageUrl,
                    videoUrl: data.message.videoUrl,
                    rawFileUrl: data.message.rawFileUrl,
                    replyToId: data.message.replyToId,
                    replyToText: data.message.replyToText,
                    createdAt: data.message.createdAt,
                },
                room: data.room,
            };
        }

        return { success: true, message: null, room: roomId };
    } catch (error) {
        console.error('Error fetching last message:', error);
        return { success: false, message: null, room: roomId };
    }
};

// Helper function to fetch messages for a room
export const fetchRoomMessages = async (roomId: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.MESSAGES_API}/room/${roomId}`);
        const data = await response.json();
        console.log('Fetched messages from API:', data);

        if (data.success && data.messages) {
            return {
                success: true,
                messages: data.messages.map((msg: any) => ({
                    id: msg.id,
                    message: msg.text,
                    userName: msg.userName,
                    userImage: msg.userImage,
                    userId: msg.userId,
                    imageUrl: msg.imageUrl,
                    videoUrl: msg.videoUrl,
                    rawFileUrl: msg.rawFileUrl,
                    replyToId: msg.replyToId,
                    replyToText: msg.replyToText,
                    createdAt: msg.createdAt,
                })),
                count: data.count,
            };
        }

        return { success: false, messages: [], count: 0 };
    } catch (error) {
        console.error('Error fetching messages from database:', error);
        return { success: false, messages: [], count: 0 };
    }
};
