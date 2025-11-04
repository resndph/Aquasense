const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const { encrypt } = require("../../utils/crypt");

class AuthenticationController {
  async authenticate(req, res) {
    const { email, password } = req.body;

    let whereClause = {};
    if (email) {
      whereClause = { email };
    } else {
      return res
        .status(401)
        .json({ error: "Você precisa do e-mail e da senha para verificar!" });
    }

    const user = await Usuario.findOne({
      where: whereClause,
    });

    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha invalidos!" });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: "Senha não está correta!" });
    }
    const { id_usuario, nome: Nome } = user;

    const { iv, content } = encrypt(id_usuario);

    const newId = `${iv}:${content}`;

    const token = jwt.sign({ newId }, process.env.HASH_BCRYPT, {
      expiresIn: process.env.EXPIRATION_TOKEN,
    });

    return res
      .status(200)
      .json({ user: { id_usuario, nome: Nome, email }, token });
  }
}

module.exports = new AuthenticationController();
