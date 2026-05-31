// TODO: implement with db = require('../db/database')
exports.getAll = (req, res) => res.json({ data: [], total: 0 });
exports.getOne = (req, res) => res.json({});
exports.create = (req, res) => res.status(201).json({});
exports.update = (req, res) => res.json({});
exports.remove = (req, res) => res.sendStatus(204);
