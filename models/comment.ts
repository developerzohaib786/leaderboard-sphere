import mongoose, { Schema, model, models } from "mongoose";

export interface icomment {
    _id?: mongoose.Types.ObjectId;
    content: string;
    vedioId?: string;
    createdBy?: string;
}

const commentSchema = new Schema<icomment>(
    {
        content: { type: String, required: true, },
        vedioId: { type: Schema.Types.ObjectId, ref: "vedio", },
        createdBy: { type: Schema.Types.ObjectId, ref: "user", },
    }, { timestamps: true },
);

const Comment = models?.Comment || model<icomment>("Comment", commentSchema);

export default Comment;