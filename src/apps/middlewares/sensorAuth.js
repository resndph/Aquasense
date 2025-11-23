const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token do serviço de sensores não fornecido." });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ error: "Formato de token inválido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SENSOR_SERVICE_SECRET);

    if (!decoded || decoded.type !== "sensor_service") {
      return res
        .status(401)
        .json({ error: "Token de serviço de sensores inválido." });
    }

    req.sensorServiceName = decoded.name || null;

    return next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: "Token de serviço de sensores inválido." });
  }
};
