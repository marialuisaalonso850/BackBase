const { jsonResponse } = require("../lib/jsonResponse");
const getTokenFromHeader = require("./getTokenFromHeader");
const {verifyAccessToken} = require("./verifyToken");

function authenticate(req, res , next){
    const token = getTokenFromHeader(req.headers);

    if(token){
        const decoded = verifyAccessToken(token);
        if(decoded){
            req.user = { ...decoded.user};
            next(); 
        }else{
            res.status(401).json(jsonResponse(401, {
                message: "no hay token"
            }));
        }
    }else{
        res.status(401).json(jsonResponse(401, {
            message: "no hay token"
        }));
    }
}

module.exports = authenticate;