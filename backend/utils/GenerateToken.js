require('dotenv').config()
const jwt=require('jsonwebtoken')

exports.generateToken=(payload,passwordReset=false)=>{
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:passwordReset?process.env.PASSWORD_RESET_TOKEN_EXPIRATION:process.env.LOGIN_TOKEN_EXPIRATION})
}