import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface Iuser {
    email: string;
    password: string;
    Name?:string;
    bio?: string;
    profileImageURL?: string;
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updateAt?: Date;
};

const userSchema = new Schema<Iuser>({
    Name: {
        type:String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
    },
    profileImageURL: {
        type: String,
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = models?.User || model<Iuser>('User', userSchema);

export default User;
