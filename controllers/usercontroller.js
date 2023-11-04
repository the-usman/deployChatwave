
const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const uuid = require('uuid')
const mongoSanitize = require('mongo-sanitize');
const multer = require('multer')
const fs = require('fs');



const Secret_Key = process.env.SECRECT_KEY


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isProfilePic = req.body.isProfilePic;
        if (isProfilePic) {
            cb(null, 'upload/profile-pic');
        } else {
            cb(null, 'upload/cover-pic');
        }
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const filename = req.user.id + '.' + ext;
        cb(null, filename)
    }
})

const upload = multer({
    storage: storage
})

const Login = async (req, res) => {
    let success = false;
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ $or: [{ username }, { email: username }] })
        if (!user) {
            return res.status(400).json({ success, error: "User not found" })
        }
        if (!user.isConfirmed) {
            return res.status(400).json({ success, error: "Please confirm your account" })
        }
        const isCorrectPass = await bcrypt.compare(password, user.password)
        if (!isCorrectPass)
            return res.status(400).json({ success, error: "Invalid Credentials" })
        const data = {
            id: user.id
        }
        const token = jwt.sign(data, Secret_Key);
        res.status(200).json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server error" })
    }
}

const CreateAccount = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        if (!name || !email || !username || !password) {
            return res.status(400).json({ "success": false, "error": "Missing required fields" });
        }

        const userExists = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (userExists) {
            if (!userExists.isConfirmed) {
                return res.status(401).json({ "success": false, "error": "User name already exists" });
            }
            else
                return res.status(400).json({ "success": false, "error": "User name already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const confirmationToken = uuid.v4();
        const newUser = new User({
            password: hashedPassword,
            email: email,
            username: username,
            name: name,
            confirmationToken: confirmationToken,
            isConfirmed: false
        });

        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EmailPassword
            }
        });

        const confirmationLink = `https://shave-hive-backend.vercel.app/user/confirm/${confirmationToken}`;
        const mailOptions = {
            from: 'noreply@example.com',
            to: email,
            subject: 'Confirm Your Email',
            text: `Click the following link to confirm your email: ${confirmationLink} \n Your Confirmation code is ${confirmationToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ "success": true });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ "success": false, "error": "Internal Server Error" });
    }
};
const confirmCode = async (req, res) => {
    try {
        const { token1 } = req.params;
        const user = await User.findOne({ confirmationToken: token1 });

        if (!user) {
            return res.status(404).render('error', { error: 'Token not found' });
        }

        user.isConfirmed = true;
        user.confirmationToken = undefined;
        await user.save();
        const data = {
            id: user.id
        }
        const token = jwt.sign(data, Secret_Key);

        res.status(200).render('success', { success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Internal server error' });
    }
};



const deleteAccountUnConfirmedAccount = async (req, res) => {
    let success = false;
    try {
        const { id } = req.body;
        const user = await User.findById(id)
        if (!user || user.isConfirmed) {
            return res.status(400).json({ success, error: "Unauthrized Action" })
        }
        const deleteedUser = await User.findByIdAndDelete(id);
        return res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}

const SearchUser = async (req, res) => {
    let success = false;
    try {
        const search = req.query.search;

        const sanitizedSearch = mongoSanitize(search);
        const userId = req.user.id;
        const users = await User.find({
            $and: [
                {
                    _id: { $ne: userId },
                    isConfirmed: true
                },
                {
                    $or: [
                        { email: { $regex: sanitizedSearch, $options: "i" } },
                        { username: { $regex: sanitizedSearch, $options: "i" } }
                    ]
                }
            ]
        },
            { password: 0 }
        );
        return res.status(200).json({ success: true, users })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}

const UpdatedUser = async (req, res) => {
    let success = false;
    try {
        const userId = req.user.id;
        const { name, Bio, city, institution, username, password } = req.body;
        const updatedData = {}
        if (name)
            updatedData.name = name;
        if (Bio)
            updatedData.Bio = Bio
        if (city)
            updatedData.city = city
        if (institution)
            updatedData.institution = institution
        if (username) {
            const checkUsername = await User.findOne({ username: username })
            if (checkUsername)
                return res.status(400).json({ success, error: "This username is already ouccpied" })
            updatedData.username = username
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(toString(password), salt);
            updatedData.password = hashedPassword;
        }
        const user = await User.findByIdAndUpdate(userId, { $set: updatedData }, { new: true }).select('-password')
        if (!user)
            return res.status(400).json({ success, "error": "User not found" })
        res.status(200).json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


const UploadImages = async (req, res) => {
    let success = false;
    try {
        if (req.file) {
            file = req.file
        } else {
            return res.status(400).json({ success, error: "No files received to upload" })
        }

        if (req.body.isProfilePic) {
            const user = await User.findByIdAndUpdate(req.user.id, { $set: { pic: file.filename } }, { new: true }).select('-password')
            if (!user) {
                return res.status(404).json({ success, error: "User not found" })
            }
            return res.status(200).json({ success: true, user })
        }
        else {
            const user = await User.findByIdAndUpdate(req.user.id, { $set: { bgPic: file.filename } }, { new: true }).select('-password')
            if (!user) {
                return res.status(404).json({ success, error: "User not found" })
            }
            return res.status(200).json({ success: true, user })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}

const DeleteUser = async (req, res) => {
    let success = false;
    try {
        const { id } = req.user
        const user = await User.findById(id)
        if (!user)
            return res.status(401).json({ success, error: "Unauthorized Action" })
        await fs.promises.unlink(`upload/cover-pic/${user.bgPic}`);
        await fs.promises.unlink(`upload/profile-pic/${user.pic}`);
        const deleteUser = await User.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: "Deleted Successfully" })
    } catch (error) {
        console.log(error)
        re.status(500).json({ success, error: "Internal Server Error" })
    }
}

const getUser = async (req, res) => {
    let success = false;
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(400).json({ success, error: "User not Found" })
        }
        res.status(200).json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


module.exports = {
    Login,
    CreateAccount,
    confirmCode,
    deleteAccountUnConfirmedAccount,
    SearchUser,
    upload,
    DeleteUser,
    UploadImages,
    UpdatedUser,
    getUser
}