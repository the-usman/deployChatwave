const jwt = require('jsonwebtoken');
const Secret_Key = process.env.SECRECT_KEY;


const ProtectedMode = async (req, res, next) => {
    let success = false;
    try {
        const token = req.headers.token;
        console.log("Token is :  ", token)
        if (!token)
            return res.status(401).json({ success, error: "Unauthorized Action" })

        const verifyData = jwt.verify(token, Secret_Key);

        if (!verifyData) {
            return res.status(401).json({ success, error: "Invalid Token" });
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (verifyData.exp && verifyData.exp < currentTimestamp) {
            return res.status(401).json({ success, error: "Token Expired" });
        }

        req.user = {
            id: verifyData.id,
        };
        console.log(req.user)
        
        success = true;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
};


module.exports = ProtectedMode;
