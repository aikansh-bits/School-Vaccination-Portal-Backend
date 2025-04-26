import User from '../models/User.js';

// Signup user
export const signupUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ status: "error", message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "User already exists with this email" });
        }

        // Generate userId
        const lastUser = await User.findOne().sort({ createdAt: -1 });
        let newUserId = "USR001"; // Default if no users

        if (lastUser && lastUser.userId) {
            const lastIdNumber = parseInt(lastUser.userId.replace('USR', '')) || 0;
            const nextIdNumber = lastIdNumber + 1;
            newUserId = `USR${nextIdNumber.toString().padStart(3, '0')}`;
        }

        // Create new user with userId
        const newUser = new User({ name, email, password, role, userId: newUserId });
        const savedUser = await newUser.save();

        res.status(201).json({
            status: "success",
            data: {
                _id: savedUser._id,
                userId: savedUser.userId,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        res.status(200).json({
            status: "success",
            data: {
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// Get profile by userId
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId }).select('-password'); // Exclude password field

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

