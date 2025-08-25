import mongoose from 'mongoose';

const MONGODB_URL=process.env.MONGODB_URL!;

if(!MONGODB_URL){
    throw new Error("⚠️Please define MONGODB_URL in your env file.")
};

let cache=global.mongoose;

if(!cache){
    cache=global.mongoose={conn:null,promise:null};
}

export async function connectToDatabase(){
    if(cache.conn){
        return cache.conn;
    }
    if(!cache.conn){
        mongoose
        .connect(MONGODB_URL)
        .then(()=>{mongoose.connection})
    }

    try {
        cache.conn= await cache.promise;
    } catch (error) {
        cache.promise=null;
        throw error;
    }

}