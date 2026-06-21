function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "P2002") return res.status(409).json({ error: "Duplicate wish code." });
  if (err.message === "Unsupported file type") return res.status(400).json({ error: err.message });
  const status = err.status || err.statusCode || 500;
  // TEMPORARY: show real error message for debugging
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message, code: err.code || null });
}
module.exports = errorHandler;