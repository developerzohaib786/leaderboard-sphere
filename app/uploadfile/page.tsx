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
            const response = await axios.post('http://localhost:3000/api/auth/vedio', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            router.push('/');
            alert("Post Created ✅:");
            console.log("Post Created ✅:", formData);
        } catch (error) {
            console.error('Axios error', error)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h2>
                                <p className="text-gray-600">Upload your video content and details</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Post Title *
                                </label>
                                <Input
                                    name="title"
                                    placeholder="Enter your post title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full h-12"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Describe your video content..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Video Upload */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Video *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <FileUpload
                                        onSuccess={handleVideoSuccess}
                                        onProgress={setVideoProgress}
                                        FileType="video"
                                    />
                                    {formData.vedioURL && (
                                        <p className="text-sm text-green-600 mt-2">✓ Video uploaded successfully</p>
                                    )}
                                </div>
                                {videoProgress > 0 && videoProgress < 100 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Uploading video...</span>
                                            <span>{videoProgress}%</span>
                                        </div>
                                        <ProgressBar now={videoProgress} className="h-2" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Upload */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Thumbnail *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <FileUpload
                                        onSuccess={handleThumbnailSuccess}
                                        onProgress={setThumbProgress}
                                        FileType="image"
                                    />
                                    {formData.thumbnailURL && (
                                        <p className="text-sm text-green-600 mt-2">✓ Thumbnail uploaded successfully</p>
                                    )}
                                </div>
                                {thumbProgress > 0 && thumbProgress < 100 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Uploading thumbnail...</span>
                                            <span>{thumbProgress}%</span>
                                        </div>
                                        <ProgressBar now={thumbProgress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transformation Settings */}
                        <div className="space-y-4 hidden">
                            <h3 className="text-lg font-medium text-gray-900">Video Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Height (px)
                                    </label>
                                    <Input
                                        type="number"
                                        name="height"
                                        placeholder="1920"
                                        value={formData.transformation.height}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                transformation: { ...prev.transformation, height: Number(e.target.value) },
                                            }))
                                        }
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Width (px)
                                    </label>
                                    <Input
                                        type="number"
                                        name="width"
                                        placeholder="1080"
                                        value={formData.transformation.width}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                transformation: { ...prev.transformation, width: Number(e.target.value) },
                                            }))
                                        }
                                        className="h-12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quality (1-100)
                                    </label>
                                    <Input
                                        type="number"
                                        name="quality"
                                        placeholder="80"
                                        min={1}
                                        max={100}
                                        value={formData.transformation.quality}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                transformation: { ...prev.transformation, quality: Number(e.target.value) },
                                            }))
                                        }
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                            >
                                Create Post
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}