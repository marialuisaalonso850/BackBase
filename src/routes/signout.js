
const getTokenFromHeader = require("../auth/getTokenFromHeader");
const router = require("express").Router();
const Token = require("../schema/token")
const {jsonResponse} = require("../lib/jsonResponse")

router.delete("/",async(req, res)=>{
    try {
        const refreshToken = getTokenFromHeader(req.headers);
        if(refreshToken){
            await Token.findOneAndRemove({token: refreshToken});
            res.status(200).json(jsonResponse(500, { message: "Server error" }));
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(jsonResponse(500, {error: "Error del server"}))
    }

});

module.exports = router;