import mongoose from "mongoose";

let chached = global.mongoose || {conn:null, promise: null};

 export default function connectDB(){
    if(chached.conn) return chached.conn;
    if(!chached.promise){
        chached.promise = mongoose.connect(process.env.MONGODB_URI).
        then((mongoose) => mongoose);
    } 
    try{
        chached.conn = await chached.promise;
    } catch (error){
        console.error("Error connecting to MongoDB:", error);
    } 
    return chached.conn
    
}