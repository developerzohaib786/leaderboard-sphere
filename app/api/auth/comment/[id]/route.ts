import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb"
import Vedio, { ivedio } from "@/models/vedio";
import { error } from "console";
import { getServerSession } from "next-auth";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();
        const vedios= await Vedio.find().sort({createdAt:-1}).lean();
        if(!vedios || vedios.length===0){
            return NextResponse.json([],
                {status:200}
            )
        }
        return NextResponse.json(vedios);

    } catch (error) {
        return  NextResponse.json({
            error:"Failed to fetch vedios"
        },{status:200})
    }
}

export async function POST(request:NextRequest){
    try {
        const session=await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                error:'Unauthorized action'
            },{status:401})
        };
        await connectToDatabase();
        const body: ivedio=await request.json();
        if(
            !body.title || 
            !body.description ||
            !body.vedioURL ||
            !body.thumbnailURL ||
            !body.transformation
        ){
            return NextResponse.json({
                error:'Missing required fields'
            },{status:400})
        }

       const vedioData={
        ...body,
        controls: body?.controls ?? true,
        transformation: {
            height:1920,
            width:1080,
            quality:body.transformation?.quality ?? 100,
        },
        };
        const newVedio= await Vedio.create(vedioData);
        return NextResponse.json(newVedio);

    } catch (error) {
        return NextResponse.json({
            error:'Failed to create vedio'
        },{status:500})
        
    }
}