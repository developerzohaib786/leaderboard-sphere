import mongoose, { Schema, model, models } from "mongoose";

export interface icomment {
    _id?: mongoose.Types.ObjectId;
    review: string;
    videoId?: string;
    userId?: string;
}

const commentSchema = new Schema<icomment>(
    {
        review: { type: String, required: true, },
        videoId: { type: Schema.Types.ObjectId, ref: "vedio", },
        userId: { type: Schema.Types.ObjectId, ref: "user", },
    }, { timestamps: true },
);

const Comment = models?.Comment || model<icomment>("Comment", commentSchema);

export default Comment;