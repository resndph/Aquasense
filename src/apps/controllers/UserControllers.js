const Usuario = require("../models/Usuario");
const Pesquisador = require("../models/Pesquisador");
const Tecnico = require("../models/Tecnico");
const TelefoneContato = require("../models/Telefone");
const database = require("../../database");
const sequelize = database.connection;

class UserControllers {
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const verifyUser = await Usuario.findOne({
        where: { email: req.body.email },
        transaction,
      });

      if (verifyUser) {
        await transaction.rollback();
        return res.status(400).send({ error: "E-mail já cadastrado!" });
      }

      const usuario = await Usuario.create(req.body, { transaction });

      // Detecta o tipo de usuário com base nos campos enviados
      const isPesquisador =
        req.body.area_atuacao ||
        req.body.instituicao_vinculo ||
        req.body.nivel_formacao;

      const isTecnico =
        req.body.especializacao ||
        req.body.registro_profissional ||
        req.body.disponibilidade;

      let tipo = "usuario";

      // Cria registro específico
      if (isPesquisador) {
        await Pesquisador.create(
          {
            id_usuario: usuario.id_usuario,
            area_atuacao: req.body.area_atuacao,
            instituicao_vinculo: req.body.instituicao_vinculo,
            nivel_formacao: req.body.nivel_formacao,
          },
          { transaction }
        );
        tipo = "pesquisador";
      } else if (isTecnico) {
        await Tecnico.create(
          {
            id_usuario: usuario.id_usuario,
            especializacao: req.body.especializacao,
            disponibilidade: req.body.disponibilidade,
            registro_profissional: req.body.registro_profissional,
          },
          { transaction }
        );
        tipo = "tecnico";
      }

      // Adiciona telefones de contato, se fornecidos
      if (req.body.telefone) {
        await TelefoneContato.create(
          {
            id_usuario: usuario.id_usuario,
            telefone_contato: req.body.telefone,
          },
          { transaction }
        );
      }

      await transaction.commit();

      return res.status(201).send({
        message: "Usuário criado com sucesso!",
        usuario: { ...usuario.toJSON(), tipo },
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({ error: "Erro ao criar usuário." });
    }
  }
}

module.exports = new UserControllers();
