import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = "7d";

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email: email.toLowerCase(), passwordHash, name });

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ id: user._id, email: user.email, name: user.name });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


