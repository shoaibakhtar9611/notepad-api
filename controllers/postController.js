const mongoose = require('mongoose');

const Post = require('../models/postModel');

exports.createNote = async (req, res, next) => {
    try {
        let note = req.body;
        note.postedBy = req.user._id;   // this is only valid for a logged in user

        const newNote =  await Post.create(note);

        res.status(201).json({
            status: 'success',
            data: {
                newNote
            }
        });

    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getNotes = async (req, res, next) => {
    try {
        // It returns a query object to which we can chain various other methods
        let query = Post.find({postedBy: req.user._id}).select('title body createdAt');

        // Displaying notes from most recent to old 
        query = query.sort('-createdAt');

        // Pagination
        const page = req.query.page * 1 || 1; // Requested page
        const limit = req.query.limit * 1 || 100;  // By default showing just 100 results in 1 page
        const skip = (page - 1) * limit;   // Skip the pages previous to the page that is to be diplayed 
        
        query = query.skip(skip).limit(limit);
    
        // Execute query
        const notes = await query;

        // User has not created any note till now
        if(notes.length === 0) {
            return res.status(200).json({
                message: 'No notes created yet!!'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                notes
            }
        })

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.editNote = async (req, res, next) => {
    try {
        const updatedNote = await Post.findByIdAndUpdate(req.params.noteID, req.body, {
            new: true,   // to return the modified document and not the original one
            runValidators: true     // validators specified in the schema runs for modified document as well
        });
        
        // If document being modified does not exist
        if(!updatedNote) {
            return res.status(404).json({
                message: 'Cannot find a note with that ID'
            });
        }
    
        res.status(200).json({
            status: 'success',
            data: {
                updatedNote
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    
};

exports.deleteNote = async (req, res, next) => {
    try {
        const note = await Post.findByIdAndDelete(req.params.noteID);

        // If document being modified does not exist
        if(!note) {
            return res.status(404).json({
                message: 'Cannot find a note with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Note deleted successfully!!'
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};