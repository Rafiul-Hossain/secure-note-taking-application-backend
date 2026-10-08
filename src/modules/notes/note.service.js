const Note = require('./note.model');
const ApiError = require('../../common/utils/ApiError');
const { buildMeta } = require('../../common/utils/pagination');

const createNote = async (userId, { title, content }) => {
  if (!title || !content) {
    throw new ApiError(400, 'title and content are required');
  }
  return Note.create({ title, content, owner: userId });
};

// User: list own notes. Uses index { owner: 1, _id: -1 }
const listMyNotes = async (userId, { page, limit, skip }) => {
  const [items, total] = await Promise.all([
    Note.find({ owner: userId }).sort({ _id: -1 }).skip(skip).limit(limit),
    Note.countDocuments({ owner: userId }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
};

// Admin: list everyone's notes. Sorted by _id, so it uses the default _id index
const listAllNotes = async ({ page, limit, skip }) => {
  const [items, total] = await Promise.all([
    Note.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email'),
    Note.estimatedDocumentCount(),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
};

// User: only own note. Admin: any note. Both lookups start from the _id index
const getNote = async (user, noteId) => {
  const isAdmin = user.role === 'admin';
  const filter = isAdmin ? { _id: noteId } : { _id: noteId, owner: user._id };

  let query = Note.findOne(filter);
  if (isAdmin) query = query.populate('owner', 'name email');

  const note = await query;
  if (!note) throw new ApiError(404, 'Note not found');
  return note;
};

// Only the owner can update (admin included, since admin only gets view access to others' notes)
const updateNote = async (userId, noteId, { title, content }) => {
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Provide title or content to update');
  }

  const note = await Note.findOneAndUpdate(
    { _id: noteId, owner: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!note) throw new ApiError(404, 'Note not found');
  return note;
};

// Only the owner can delete
const deleteNote = async (userId, noteId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, owner: userId });
  if (!note) throw new ApiError(404, 'Note not found');
};

module.exports = {
  createNote,
  listMyNotes,
  listAllNotes,
  getNote,
  updateNote,
  deleteNote,
};