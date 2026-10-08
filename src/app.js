const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./common/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/notes', require('./modules/notes/note.routes'));
app.use('/api/v1/posts', require('./modules/posts/post.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;