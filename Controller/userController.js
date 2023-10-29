const asyncHandler = require('express-async-handler');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const bcrypt = require('bcrypt');

const SecretKey = process.env.SECRECT_key;

const SignUpUser = asyncHandler(async (req, res) => {
    let success = false;
    const { name, password, email, pic } = req.body;

    if (!req.body.password || !req.body.name || !req.body.email) {
        return res.status(400).json({ success, error: "Invalid Request" });
    }


    // Use await when generating the salt and hashing the password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password.toString(), salt);


    const ExistUser = await User.findOne({ email: email });
    if (ExistUser) {
        return res.status(400).json({ success, error: "User already exists" });
    }

    const user = await User.create({
        email: email,
        name: name,
        password: secPass,
        pic: pic
    });

    if (user) {
        const data = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(data, SecretKey, {
            expiresIn: "30d"
        });

        return res.status(200).json({
            success: true,
                id: user._id,
                email: user.email,
                pic: user.pic,
                name: user.name,
                token
            
        });
    } else {
        return res.status(400).json({ success, error: "Failed to create user" });
    }
});

const LoginUser = asyncHandler(async (req, res) => {
    let success = false;
    const { password, email } = req.body;

    if (!req.body.password || !req.body.email) {
        return res.status(400).json({ success, error: "Invalid Request" });
    }


    const ExistUser = await User.findOne({ email: email });
    if (!ExistUser) {
        return res.status(400).json({ success, error: "User not exists" });
    }
    const pass = await bcrypt.compare(password, ExistUser.password)
    if (!pass)
        return res.status(400).json({ success, error: "Invalid credential" })
    if (ExistUser) {
        const data = {
            user: {
                id: ExistUser.id
            }
        };
        const token = jwt.sign(data, SecretKey, {
            expiresIn: "30d"
        });

        return res.status(200).json({
            success: true,
            id: ExistUser._id,
            email: ExistUser.email,
            pic: ExistUser.pic,
            name: ExistUser.name,
            token
        });
    } else {
        return res.status(400).json({ success, error: "Failed to login user" });
    }
});



// For Storing image in the multer

const UpdatedUser = asyncHandler(async () => {
    const { name, email, password } = req.body;
    if (!req.body.password || !req.body.name || !req.body.email) {
        return res.status(400).json({ success, error: "Invalid Request" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password.toString(), salt);
    const ExistUser = await User.findOne({ email: email });
    if (!ExistUser) {
        return res.status(400).json({ success, error: "User already exists" });
    }

})

const allUser = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};
    const user = await User.find({
        ...keyword,
        _id: { $ne: req.user.id }
    });
    res.send(user)
})

module.exports = {
    SignUpUser,
    LoginUser,
    allUser
};
