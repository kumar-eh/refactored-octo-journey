const { v4: uuid } = require("uuid");

function correlationId(req, res, next) {
  const id = uuid();
  req.correlationId = id;
  res.setHeader("X-Correlation-ID", id);
  next();
}

module.exports = correlationId;