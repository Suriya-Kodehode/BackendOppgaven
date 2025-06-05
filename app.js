import generateJwtSecret from './util/config.js';
generateJwtSecret();

import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import { transformToLowercaseMiddleware } from './middleware/transformToLowercase.js';
import { errorMiddleware } from './middleware/errorHandler.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(transformToLowercaseMiddleware);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    })
);

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // console.warn("404 Not Found:", req.originalUrl);
    next(createError(404));
});

// centralized error handler
app.use(errorMiddleware);

export default app;