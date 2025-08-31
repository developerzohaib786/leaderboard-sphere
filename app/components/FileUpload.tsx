"use client"

import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    upload,
} from "@imagekit/next";
import { useState } from "react";

interface UploadResponse{
    url:string,
    fileId:string,
    name:string,
}

interface FileUploadProps {
    onSuccess: (res: UploadResponse) => void,
    onProgress?: (progress: number) => void,
    FileType: 'image' | 'video',
}



const FileUpload = ({ onSuccess, onProgress, FileType }: FileUploadProps) => {

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileValidator = (file: File) => {
        if (FileType === 'video') {
            if (!file.type.startsWith('video/')) {
                setError('Please Upload a valid video file')
            }
        };
        if (file.size > 30 * 1024 * 1024) {
            setError('Please upload file less than 30MB');
        }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];
        console.log(`Uploaded file is: ${file}`);

        if (!file || !fileValidator(file)) return;
        setUploading(true);
        setError(null);
        try {
            const authResponse = await axios.get('http://localhost:3000/api/auth/vedio');
            const auth = authResponse.data;
            
            // Debug logging
            console.log('Auth response:', auth);
            
            if (!auth.token || !auth.signature || !auth.expire) {
                throw new Error('Missing authentication parameters');
            }
            
           const res= await upload({
            file,
            fileName: file.name, 
            publicKey:process.env.NEXT_PUBLIC_PUBLIC_KEY!,
            expire:auth.expire,
            token:auth.token,
            signature:auth.signature,
            onProgress: (event) => {
                if(event.lengthComputable && onProgress){
                    const percent=(event.loaded/event.total)*100;
                    onProgress(Math.round(percent));
                }
                        },
        })
        onSuccess(res as UploadResponse);

        } catch (error) {

            console.error("Upload fialed",error);
        }finally{
            setUploading(false);
        }
        
    }

    return (
        <>
            <input
                type="file"
                accept={FileType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
            />
            {uploading && (
                <div>
                    Loading...
                </div>
            )}
            <div>{error}</div>
            <Button type="submit">Upload Vedio</Button>

        </>
    );
};

export default FileUpload;