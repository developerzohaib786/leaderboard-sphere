import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Comment, { icomment } from "@/models/comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb"


// export const POST = async (req) => {    
//     try {
//         await connectDb();
//         const { postid, text , parentid ,userid ,comId} = await req.json();
//         if (!postid) {
//             return NextResponse.json({ error: "postid is required" }, { status: 400 });
//         }
//         if (!mongoose.Types.ObjectId.isValid(postid)) {
//             return NextResponse.json({ error: "Invalid postid" }, { status: 400 });
//         }
//         if (!userid) {
//             return NextResponse.json({ error: "userid is required" }, { status: 400 });
//         }
//         if (!mongoose.Types.ObjectId.isValid(userid)) {
//             return NextResponse.json({ error: "Invalid userid" }, { status: 400 });
//         }
//         if (!text) {
//             return NextResponse.json({ error: "text is required" }, { status: 400 });
//         }
//         // Determine parent and depth safely
//         let depth = 0;
//         let parentRef = null;
//         if (parentid) {
//             if (!mongoose.Types.ObjectId.isValid(parentid)) {
//                 return NextResponse.json({ error: "Invalid parentid" }, { status: 400 });
//             }
//             const parent = await Comment.findById(parentid).select('post depth');
//             if (!parent) {
//                 return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
//             }
//             if (String(parent.post) !== String(postid)) {
//                 return NextResponse.json({ error: "Parent comment does not belong to the same post" }, { status: 400 });
//             }
//             if (parent.depth >= 5) {
//                 return NextResponse.json({ error: "Maximum reply depth reached" }, { status: 400 });
//             }
//             depth = parent.depth + 1;
//             parentRef = parentid;
//         }

//         const comment = new Comment({
//             post: postid,
//             user: userid,
//             text,
//             parent: parentRef,
//             depth,
//             comId: comId,
//         });
//         await comment.save();
//         return NextResponse.json({ comment }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export const DELETE = async (req) => {
//     try {
//         await connectDb();
//         const { commentid } = await req.json();

//         if (!commentid) {
//             return NextResponse.json({ error: "commentid is required" }, { status: 400 });
//         }
//         if (!mongoose.Types.ObjectId.isValid(commentid)) {
//             return NextResponse.json({ error: "Invalid commentid" }, { status: 400 });
//         }
//         const comment = await Comment.findById(commentid)
//         if (!comment) {
//             return NextResponse.json({ error: "Comment not found" }, { status: 404 });
//         }
//         comment.isDeleted = true;
//         await comment.save();
//         return NextResponse.json({ comment }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }
// export const PUT = async (req) => {
//     try {
//         await connectDb();
//         const { commentid , text} = await req.json();
//         if (!commentid) {
//             return NextResponse.json({ error: "commentid is required" }, { status: 400 });
//         }
//         if (!mongoose.Types.ObjectId.isValid(commentid)) {
//             return NextResponse.json({ error: "Invalid commentid" }, { status: 400 });
//         }
//         const comment = await Comment.findById(commentid);
//         if (!comment) {
//             return NextResponse.json({ error: "Comment not found" }, { status: 404 });
//         }
//         comment.text = text;
//         await comment.save();
//         return NextResponse.json({ comment }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

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