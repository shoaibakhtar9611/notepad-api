const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password should contain atleast 8 characters'] 
    }
});

// Doucment middleware that runs before data is saved in the database
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if(!this.isModified('password')) {
        return next();
    }

    // Hash the password with a cost of 12(salt value)
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

// Check if login password of user is same as that in the database
userSchema.methods.correctPassword = async function(candidatePassword, hashedPassword) {

    return await bcrypt.compare(candidatePassword, hashedPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;