const asyncHandler = require('../../common/utils/asyncHandler');
const { getPagination } = require('../../common/utils/pagination');
const noteService = require('./note.service');

const create = asyncHandler(async (req, res) => {
  const data = await noteService.createNote(req.user._id, req.body);
  res.status(201).json({ message: 'Note created', data });
});

const listMine = asyncHandler(async (req, res) => {
  const { items, meta } = await noteService.listMyNotes(
    req.user._id,
    getPagination(req.query)
  );
  res.json({ message: 'Notes fetched', data: items, meta });
});

const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await noteService.listAllNotes(getPagination(req.query));
  res.json({ message: 'All notes fetched', data: items, meta });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await noteService.getNote(req.user, req.params.id);
  res.json({ message: 'Note fetched', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await noteService.updateNote(req.user._id, req.params.id, req.body);
  res.json({ message: 'Note updated', data });
});

const remove = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.user._id, req.params.id);
  res.json({ message: 'Note deleted' });
});

module.exports = { create, listMine, listAll, getOne, update, remove };