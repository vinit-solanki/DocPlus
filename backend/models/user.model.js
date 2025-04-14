import mongoose from "mongoose";
import UserSchema from "../schemas/users.schema";

const userModel = mongoose.model("user", UserSchema);
export default userModel;