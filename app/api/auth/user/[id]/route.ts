import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        
        // Get the user ID from the URL parameter
        const userId = params.id;
        
        if (!userId) {
            return NextResponse.json({
                error: "User ID is required"
            }, { status: 400 });
        }

        // Find the user by ID and exclude the password field
        const user = await User.findById(userId)
            .select('-password') // Exclude password from response
            .lean();

        if (!user) {
            return NextResponse.json({
                error: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({
            error: "Failed to fetch user"
        }, { status: 500 });
    }
}

// Optional: Get current logged-in user info
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 });
        }

        await connectToDatabase();

        // Get current user's info
        const user = await User.findOne({ email: session.user?.email })
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json({
                error: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json({
            error: "Failed to fetch user"
        }, { status: 500 });
    }
}