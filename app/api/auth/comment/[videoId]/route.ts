import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Comment from "@/models/comment";

