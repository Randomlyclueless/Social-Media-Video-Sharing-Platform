import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //The one who is subscribing
        ref: "User"
    },
    channel:{
        // the one to whom subscriber subscribes
        type: Schema.Types.ObjectId, 
        ref: "User"
    }
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema )