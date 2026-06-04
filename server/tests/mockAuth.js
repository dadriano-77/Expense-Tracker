// Replaces auth middleware in Jest tests — bypasses JWT verification
// and sets req.user.id = 0 to match the DEFAULT 0 user_id in test data.
module.exports = (req, res, next) => {
  req.user = { id: 0 };
  next();
};
