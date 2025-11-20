const verifyJwt = require("./authentication");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.newId = null;
    req.userRole = "public";  // tipo especial para visitantes
    return next();
  }

  try {
    await verifyJwt(req, res, next);
  } catch (err) {
    req.newId = null;
    req.userRole = "public";
    return next();
  }
};
