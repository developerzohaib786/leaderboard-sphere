import { NextRequest, NextResponse } from "next/server";
import Comment, { icomment } from "@/models/comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose";

// === API TO POST Comment===>
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: 'Unauthorized action'
            }, { status: 401 })
        };
        await connectToDatabase();
        const body: icomment = await request.json();
        if (
            !body.review ||
            !body.videoId ||
            !body.userId
        ) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 })
        }
        const newComment = await Comment.create(body);
        return NextResponse.json(newComment);
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to create comment'
        }, { status: 500 })
    }
}

// === API TO GET Vedio specified Comments===>
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json({ error: "videoId query parameter is required" }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return NextResponse.json({ error: "Invalid videoId format" }, { status: 400 });
        }

        // DEBUGGING: Add a log to see what we're querying for
        console.log(`Searching for comments with videoId: ${videoId}`);

        // THE FIX: Try without populate first to see if the query works
        const comments = await Comment.find({ videoId: videoId })
            .sort({ createdAt: -1 });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch comments:", error); 
        return NextResponse.json({
            error: 'Failed to fetch comments'
        }, { status: 500 });
    }
}
