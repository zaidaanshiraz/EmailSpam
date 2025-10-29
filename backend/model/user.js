import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        name: { type: String },
    },
    { timestamps: true }
);

const User = mongoose.model("users", UserSchema);

export default User;



