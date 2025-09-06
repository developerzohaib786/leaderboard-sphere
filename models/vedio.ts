import mongoose,{Schema, model, models} from "mongoose";

export const vedio_dimensions={
    width:1080,
    height:1920,
} as const;

export interface itranformation{
    width:number;
    height:number;
    quality?:number;
};

export interface ivedio{
    _id?:mongoose.Types.ObjectId;
    title:string;
    description:string;
    like: mongoose.Types.ObjectId[]; 
    vedioURL:string;
    thumbnailURL:string;
    controls?:boolean;
    transformation:itranformation;
}

const vedioSchema=new Schema<ivedio>(
{
    title:{type:String, required:true, },
    description:{type:String, required:true, },
    vedioURL:{type:String, required:true, },
    thumbnailURL:{type:String, required:true, },
    controls:{type:Boolean,default:true},
    like: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    transformation:{
        height:{type:Number,default:vedio_dimensions},
        width:{type:Number,default:vedio_dimensions},
        quality:{type:Number,min:1,max:100}
    }

},{timestamps:true},
);

const Vedio=models?.Vedio || model<ivedio>("Vedio",vedioSchema);

export default Vedio;