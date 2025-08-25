import { connectToDatabase } from "@/lib/mongodb";
import User from '@/models/user';
import { error } from "console";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try {
        const {email,password}=await request.json();
        if(!email || !password){
            return NextResponse.json({
                error:"All fields are important!"
            },{status:400})
        }
        await connectToDatabase();
        const existingUser=User.findOne({email});
        if(!existingUser){
            return NextResponse.json({
                error:'User already exists!'
            },{status:400})
        }
        await User.create({
            email,password
        });
        return NextResponse.json({
            error:"User Registration was Successful"
        },{status:200});
    } catch (error) {
        console.error("User Registration Error: ",error);
        return NextResponse.json({
            error:"Registration Error"
        },{status:400})
    }
}