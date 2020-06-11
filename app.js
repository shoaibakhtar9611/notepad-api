const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = express();

// Used to parse JSON bodies
app.use(express.json());
// Set security HTTP header
app.use(helmet());
// Morgan is basically a logger middleware, on any requests being made,it generates logs automatically
app.use(morgan('dev'));
// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data Sanitization against XSS/Cross-site Scripting
app.use(xss());

const postRouter = require('./routes/postRoute');
const authRouter = require('./routes/authRoute');

// Routes
app.use('/api/notes', postRouter);
app.use('/api', authRouter);

// For routes that are not defined
app.all('*', (req, res, next) => {
    return res.status(404).json({
      message: `Can't find ${req.originalUrl} on this Server!!`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
});

// Connection to the database
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connection successful!!');
});

// Server 
const port=process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}....`);
});
