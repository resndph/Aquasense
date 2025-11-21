const Usuario = require("../models/Usuario");
const Tecnico = require("../models/Tecnico");
const Pesquisador = require("../models/Pesquisador");

function hasRole(...rolesAllowed) {
  return async (req, res, next) => {
    try {
      const id = req.newId; // ID do usuário autenticado

      // admin sempre passa
      if (req.userRole === "admin" && rolesAllowed.includes("admin")) {
        return next();
      }

      // verifica papel real no banco
      let userRole = null;

      if (await Tecnico.findOne({ where: { id_usuario: id } })) {
        userRole = "tecnico";
      } else if (await Pesquisador.findOne({ where: { id_usuario: id } })) {
        userRole = "pesquisador";
      } else {
        userRole = "usuario";
      }

      // valida se é permitido
      if (!rolesAllowed.includes(userRole)) {
        return res.status(403).json({
          message: "Acesso negado. Permissão insuficiente."
        });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro de autorização." });
    }
  };
}

module.exports = hasRole;
