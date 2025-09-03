"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Transformation {
    height: number;
    width: number;
    quality: number;
}

interface VideoData {
    _id: string;
    title: string;
    description: string;
    vedioURL: string;
    thumbnailURL: string;
    controls: boolean;
    transformation: Transformation;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export default function VideoFeed() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/auth/vedio');
            setVideos(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setError('Failed to load videos');
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <button 
                        onClick={fetchVideos}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Feed</h1>
                    <p className="text-gray-600">Watch and enjoy our latest video content</p>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No videos found</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {videos.map((video) => (
                            <div 
                                key={video._id} 
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Video Container */}
                                <div className="relative">
                                    {/* Video */}
                                    <div className="relative w-full bg-black">
                                        <video
                                            controls={video.controls}
                                            poster={video.thumbnailURL}
                                            className="w-full h-auto max-h-96 object-contain"
                                            preload="metadata"
                                        >
                                            <source src={video.vedioURL} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                        
                                        {/* Overlay Content on Video (Optional) */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
                                            <span className="text-sm font-medium">HD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="px-6 pt-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {video.title}
                                    </h2>
                                </div>

                                {/* Description and Metadata */}
                                <div className="px-6 py-6">
                                    <div className="mb-4">
                                        <p className="text-gray-700 text-base leading-relaxed">
                                            {video.description}
                                        </p>
                                    </div>

                                    {/* Video Info */}
                                    <div className="border-t pt-4">
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span>Quality: {video.transformation.quality}%</span>
                                            <span>•</span>
                                            <span>Resolution: {video.transformation.width}x{video.transformation.height}</span>
                                            <span>•</span>
                                            <span>Posted: {formatDate(video.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}