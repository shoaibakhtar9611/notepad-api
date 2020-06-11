const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');

const createToken = (user, statusCode, res) => {

    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    const token = jwt.sign({userID: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRES_IN});

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res, next) => {
    try {
        const check_user = await User.findOne({email: req.body.email});

        // check if user already exists or not
        if(check_user) {
            return res.status(403).json({
                error: 'User already exists!!'
            });
        }

        const newUser = await User.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                newUser
            }
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // check that email and password both exists
        if(!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password!!'
            });
        }

        // check if user exists or not
        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return res.status(401).json({
                error: 'Please register first!!'
            });
        }

        // check if the password provided by user is correct or not
        const valid = await user.correctPassword(password, user.password);
        if(!valid) {
            return res.status(401).json({
                error: 'Incorrect email or password!!'
            });
        }

        //console.log(user);

        // If everything is ok then, send token to the client
        createToken(user, 200, res);

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// for protecting routes
exports.protect = async (req, res, next) => {
    // get the token and check if it exists or not
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return res.status(401).json({
            error: 'You are not logged in. Please log in first!!'
        });
    }

    // verification of token
    const decode_token = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    //console.log('Decoded token: ', decode_token);

    // check if the user still exists or not
    const currentUser = await User.findById(decode_token.userID);
    if(!currentUser) {
        return res.status(401).json({
            error: 'The user belonging to this token no longer exists!!'
        });
    }

    // Grant access to protected route
    req.user = currentUser;

    next();
};