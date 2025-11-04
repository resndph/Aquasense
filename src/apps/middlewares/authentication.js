const { decryptedToken } = require("../../utils/token");
const { decrypt } = require("../../utils/crypt");

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não definido" });
  }

  try {
    const { newId } = await decryptedToken(authHeader);
    req.newId = parseInt(decrypt(newId));

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = verifyJwt;
