const { decryptedToken } = require("../../utils/token");
const { decrypt } = require("../../utils/crypt");

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não definido" });
  }

  try {
    const decoded = await decryptedToken(authHeader);
    const { newId, role } = decoded;
    req.newId = parseInt(decrypt(newId));
    req.userRole = role || "usuario";

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = verifyJwt;
