module.exports = (req, res, next) => {
  const usuarioId = req.newId;
  const paramId = req.params.id;
  if (req.userRole === "admin") {
    return next();
  }
  if (String(usuarioId) === String(paramId)) {
    return next();
  }
  return res
    .status(403)
    .json({ error: "Você não tem permissão para acessar este recurso." });
};
