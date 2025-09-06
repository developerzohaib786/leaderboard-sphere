import { connectToDatabase } from "@/lib/mongodb";
import User from '@/models/user';
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password, bio, profileImageURL,Name } = await request.json();

        if (!email || !password ) {
            console.log('Body is missing Name, email, passowrd, or Biography')
            return NextResponse.json({
                error: "All fields are important!"
            }, { status: 400 })
        }
        await connectToDatabase();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists');
            return NextResponse.json({
                error: 'User already exists!'
            }, { status: 400 })
        }
        await User.create({
            email, password, bio, profileImageURL, Name
        });
        console.log('User created successfuly');
        return NextResponse.json({
            message: "User Registration was Successful"
        }, { status: 200 });
    } catch (error) {
        console.error("User Registration Error: ", error);
        return NextResponse.json({
            error: "Registration Error"
        }, { status: 400 })
    }
}