const jwt = require('jsonwebtoken')
const SecretKey = process.env.SECRECT_key

const fetchUser = async (req, res, next) => {
    let success = false
    try {
        const token = req.header('token')
        if (!token) {
            return res.status(400).json({ success, error: "Please authicate withe correct token" })
        }
        const decoded = jwt.verify(token, SecretKey);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        const expirationTimestamp = decoded.iat + thirtyDaysInSeconds;
        if (!expirationTimestamp > currentTimestamp) {
            console.log('Token is valid and not expired.');
            return res.status(400).json({success, error : "Your Token is experied please login again"})
        }
        req.user = decoded.user
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({ success, error: "Internal server error" })
    }
}

module.exports = fetchUser;