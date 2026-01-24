// API Configuration
export const API_CONFIG = {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    MESSAGES_API: '/api/messages',
};

// Helper function to fetch messages for a room
export const fetchRoomMessages = async (roomId: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.MESSAGES_API}/room/${roomId}`);
        const data = await response.json();

        if (data.success && data.messages) {
            return {
                success: true,
                messages: data.messages.map((msg: any) => ({
                    message: msg.text,
                    userName: msg.userName,
                    userImage: msg.userImage,
                    userId: msg.userId,
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
