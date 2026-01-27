const BACKEND_URL = 'http://localhost:3001';

// Upload file
export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BACKEND_URL}/api/cloudinary/upload`, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    // Returns: { success, url, publicId, resourceType, format, size }
    return data;
}

// Delete file
async function deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw') {
    const response = await fetch(`${BACKEND_URL}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, resourceType }),
    });

    const data = await response.json();
    // Returns: { success: true/false, message, result }
    return data.success;
}