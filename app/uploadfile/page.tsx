"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUpload from "../components/FileUpload";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Transformation {
    height: number;
    width: number;
    quality: number;
}

interface PostData {
    title: string;
    description: string;
    vedioURL: string;
    thumbnailURL: string;
    transformation: Transformation;
}

export default function PostMaker() {
    const [formData, setFormData] = useState<PostData>({
        title: "",
        description: "",
        vedioURL: "",
        thumbnailURL: "",
        transformation: { height: 1920, width: 1080, quality: 80 },
    });

    const [error, setError] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [thumbProgress, setThumbProgress] = useState(0);
    const router = useRouter();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVideoSuccess = (res: { url: string }) => {
        console.log("Video uploaded successfully:", res);
        setFormData((prev) => ({ ...prev, vedioURL: res.url }));
    };

    const handleThumbnailSuccess = (res: { url: string }) => {
        console.log("Thumbnail uploaded successfully:", res);
        setFormData((prev) => ({ ...prev, thumbnailURL: res.url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.description ||
            !formData.vedioURL ||
            !formData.thumbnailURL
        ) {
            setError("All fields are required!");
            return;
        }

        setError(null);
        console.log("Form data is this✅:", formData);



        try {
            const response = await axios.post('http://localhost:3000/api/auth/vedio',formData, {
            headers: {
                'Content-Type': 'application/json',
            }});
            router.push('/');
            alert("Post Created ✅:");
            console.log("Post Created ✅:", formData);
        } catch (error) {
            console.error('Axios error', error)
        }

    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    name="title"
                    placeholder="Post Title"
                    value={formData.title}
                    onChange={handleChange}
                />

                <input
                    type="textarea"
                    name="description"
                    placeholder="Post Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                {/* Video Upload */}
                <div>
                    <label className="block font-medium mb-1">Upload Video</label>
                    <FileUpload
                        onSuccess={handleVideoSuccess}
                        onProgress={setVideoProgress}
                        FileType="video"
                    />
                    {videoProgress > 0 && (
                        <ProgressBar now={videoProgress} label={`${videoProgress}%`} />
                    )}
                </div>

                {/* Thumbnail Upload */}
                <div>
                    <label className="block font-medium mb-1">Upload Thumbnail</label>
                    <FileUpload
                        onSuccess={handleThumbnailSuccess}
                        onProgress={setThumbProgress}
                        FileType="image"
                    />
                    {thumbProgress > 0 && (
                        <ProgressBar now={thumbProgress} label={`${thumbProgress}%`} />
                    )}
                </div>

                {/* Transformation Fields */}
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        type="number"
                        name="height"
                        placeholder="Height"
                        value={formData.transformation.height}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                transformation: { ...prev.transformation, height: Number(e.target.value) },
                            }))
                        }
                    />

                    <Input
                        type="number"
                        name="width"
                        placeholder="Width"
                        value={formData.transformation.width}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                transformation: { ...prev.transformation, width: Number(e.target.value) },
                            }))
                        }
                    />

                    <Input
                        type="number"
                        name="quality"
                        placeholder="Quality (1-100)"
                        min={1}
                        max={100}
                        value={formData.transformation.quality}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                transformation: { ...prev.transformation, quality: Number(e.target.value) },
                            }))
                        }
                    />
                </div>


                <Button type="submit" className="w-full">
                    Create Post
                </Button>
            </form>
        </div>
    );
}
