"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Avatar from '@/public/default-image.png';
import Image from "next/image";
import { twMerge } from "tailwind-merge";

interface Transformation {
    height: number;
    width: number;
    quality: number;
}

interface IComment {
    _id: string;
    review: string;
    userId: {
        _id: string;
        name: string;
        profileImageURL: string;
        email: string;
    };
    createdAt: string;
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

interface UserData {
    _id?: string;
    Name?: string;
    email: string;
    bio?: string;
    profileImageURL?: string;
    createdAt?: string;
    updatedAt?: string;
}



export default function VideoFeed() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [comments, setComments] = useState<Record<string, IComment[]>>({});

    const fetchComments = async (videoId: string) => {
        try {
            console.log(`Fetching comments for videoId: ${videoId}`); // LOG 1: Check if function is called
            const response = await axios.get(`/api/auth/comment?videoId=${videoId}`);

            // THE FIX: Log the actual data you received from the API
            console.log('API Response Data:', response.data); // LOG 2: See what the API returned

            setComments(prev => ({
                ...prev,
                [videoId]: response.data
            }));
        } catch (error) {
            // LOG 3: This will run if the API call fails
            console.error("Failed to fetch comments:", error);
            setComments(prev => ({
                ...prev,
                [videoId]: [] // Set to empty array on error
            }));
        }
    };

    //-------- Specified code block for review functionality begins here-------------------
    const [activeReviews, setActiveReviews] = useState<Set<string>>(new Set());
    const [reviewTexts, setReviewTexts] = useState<Record<string, string>>({});

    const toggleReviewInput = (videoId: string) => {
        setActiveReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
                setReviewTexts(prevTexts => {
                    const { [videoId]: _, ...rest } = prevTexts;
                    return rest;
                });
            } else {
                newSet.add(videoId);
                fetchComments(videoId);

            }
            return newSet;
        });
    };

    const handleReviewTextChange = (videoId: string, text: string) => {
        setReviewTexts(prev => ({
            ...prev,
            [videoId]: text
        }));
    };

    const submitReview = async (videoId: string) => {
        const reviewText = reviewTexts[videoId];
        if (!reviewText?.trim()) return;

        try {
            await axios.post('http://localhost:3000/api/auth/comment/', {
                videoId,
                review: reviewText,
                userId: user?._id
            });

            // Clear the input text
            setReviewTexts(prev => {
                const { [videoId]: _, ...rest } = prev;
                return rest;
            });

            // Refresh the comments list to show the new one
            await fetchComments(videoId);

            console.log('Review submitted successfully');
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // -------------------------- specified code block for review functionality ends here -----------------------
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.post('http://localhost:3000/api/auth/user/7782438243');
                const res = response.data;
                setUser(res);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUserData();
    }, []);

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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
                    <p className="text-white">Loading videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex items-center gap-4 p-6">
                    <div>
                        <Image
                            className="rounded-full size-15 bg-transparent"
                            src={Avatar}
                            alt="User"
                            fill={false}
                        />
                    </div>

                    {/* Text content stacked in column */}
                    <div className="flex flex-col">
                        <span className="font-semibold text-white">Name</span>
                        <span className="text-sm text-white">Bio</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-white text-lg">{error}</p>
                    <button
                        onClick={fetchVideos}
                        className="mt-4 px-4 py-2 bg-lime-400 text-black rounded-md hover:bg-lime-500"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-lime-400 mb-2">See the Talent of Pakistan</h1>
                    <p className="text-white">The biggest Tech Projects are listed on LeaderBoard Sphere</p>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white text-lg">No videos found</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {videos.map((video) => (
                            <div
                                key={video._id}
                                className="bg-gray-900 overflow-hidden duration-300"
                            >
                                {/* ... existing video content ... */}
                                <div className="relative">
                                    {/* User Info display */}
                                    <div className="flex items-center gap-4 p-6">
                                        <div>
                                            <Image
                                                className="rounded-full size-15 bg-transparent"
                                                src={user?.profileImageURL ? user.profileImageURL : (Avatar)}
                                                alt="User"
                                                fill={false}
                                            />
                                        </div>

                                        {/* Text content stacked in column */}
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-lime-400">{user?.Name ? user.Name : (user?.email)}</span>
                                            <span className={twMerge("text-sm text-white", !user?.bio && 'hidden')}>{user?.bio}</span>
                                            <span className="text-white">Posted: {formatDate(video.createdAt)}</span>
                                        </div>
                                    </div>
                                    {/* Video */}
                                    <div className="relative w-full bg-black">
                                        <video
                                            controls={video.controls}
                                            poster={video.thumbnailURL}
                                            className="w-full h-auto max-h-96 object-cover"
                                            preload="metadata"
                                        >
                                            <source src={video.vedioURL} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>

                                        {/* Overlay Content on Video (Optional) */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-lime-400 px-3 py-1">
                                            <span className="text-sm font-medium">HD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="px-2 pt-1">
                                    <h2 className="text-2xl font-bold text-lime-400">
                                        {video.title}
                                    </h2>
                                </div>

                                {/* Description and Metadata */}
                                <div className="px-2 pb-1">
                                    <div className="mb-4">
                                        <p className="text-white text-base leading-relaxed">
                                            {video.description}
                                        </p>
                                    </div>

                                </div>
                                {/* Interaction Bar */}
                                <div className="px-6 py-4 border-t border-gray-700">
                                    <div className="flex items-center justify-between">
                                        {/* Star Button */}
                                        <button className="flex items-center space-x-2 text-white hover:text-lime-400 transition-colors duration-200 group">
                                            <div className="p-2 rounded-full group-hover:bg-gray-800 transition-colors duration-200">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="feather feather-star"
                                                >
                                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium">Star</span>
                                        </button>

                                        {/* Review Button */}
                                        <button onClick={() => toggleReviewInput(video._id)}
                                            className={twMerge(
                                                "flex items-center space-x-2 text-white hover:text-lime-400 transition-colors duration-200 group",
                                                activeReviews.has(video._id) && "text-lime-400"
                                            )}>
                                            <div className="p-2 rounded-full group-hover:bg-gray-800 transition-colors duration-200">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="feather feather-message-circle"
                                                >
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {activeReviews.has(video._id) ? 'Cancel Review' : 'Post a Review'}
                                            </span>
                                        </button>
                                        {/* Share Button */}
                                        <button className="flex items-center space-x-2 text-white hover:text-lime-400 transition-colors duration-200 group">
                                            <div className="p-2 rounded-full group-hover:bg-gray-800 transition-colors duration-200">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="feather feather-share-2"
                                                >
                                                    <circle cx="18" cy="5" r="3"></circle>
                                                    <circle cx="6" cy="12" r="3"></circle>
                                                    <circle cx="18" cy="19" r="3"></circle>
                                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium">Share</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Review Input Section */}
                                {activeReviews.has(video._id) && (
                                    <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <Image
                                                    className="rounded-full size-8 bg-transparent"
                                                    src={user?.profileImageURL ? user.profileImageURL : Avatar}
                                                    alt="User"
                                                    width={32}
                                                    height={32}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={reviewTexts[video._id] || ''}
                                                    onChange={(e) => handleReviewTextChange(video._id, e.target.value)}
                                                    placeholder="Write your review..."
                                                    className="w-full p-3 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-900 text-white placeholder-gray-400"
                                                    rows={3}
                                                    maxLength={500}
                                                />
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-sm text-lime-400">
                                                        {reviewTexts[video._id]?.length || 0}/500 characters
                                                    </span>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => toggleReviewInput(video._id)}
                                                            className="px-4 py-2 text-white bg-gray-900 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors duration-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => submitReview(video._id)}
                                                            disabled={!reviewTexts[video._id]?.trim()}
                                                            className="px-4 py-2 bg-lime-400 text-black rounded-md hover:bg-lime-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            Post Review
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* === COMMENTS Display === */}
                                        <div className="mt-8 pt-6 border-t border-gray-700">
                                            <h3 className="text-lg font-semibold text-white mb-4 ">
                                                Comments ({comments[video._id]?.length || 0})
                                            </h3>
                                            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 no-scrollbar">
                                                {comments[video._id] && comments[video._id].length > 0 ? (
                                                    comments[video._id].map((comment) => (
                                                        <div key={comment._id} className="flex items-start space-x-3">
                                                            <Image
                                                                className="rounded-full size-8"
                                                                src={comment.userId.profileImageURL || Avatar}
                                                                alt={comment.userId.name || 'user'}
                                                                width={32}
                                                                height={32}
                                                            />
                                                            <div className="flex-1 bg-gray-900 p-3 rounded-lg">
                                                                <span className="font-semibold text-lime-400 text-sm">
                                                                    {comment.userId.name || comment.userId.email}
                                                                </span>
                                                                <p className="text-white text-sm mt-1">{comment.review}</p>
                                                                <span className="text-xs text-gray-400 mt-2 block">
                                                                    {formatDate(comment.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}