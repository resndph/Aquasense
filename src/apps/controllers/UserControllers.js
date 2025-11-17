const Usuario = require("../models/Usuario");
const Pesquisador = require("../models/Pesquisador");
const Tecnico = require("../models/Tecnico");
const TelefoneContato = require("../models/Telefone");
const database = require("../../database");
const bcryptjs = require("bcryptjs");
const sequelize = database.connection;

class UserControllers {
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const loggedUserRole = req.userRole;

      if ("role" in req.body) {
        if (req.body.role !== "usuario" && loggedUserRole !== "admin") {
          await transaction.rollback();
          return res.status(403).json({
            message: "Você não tem permissão para criar um administrador.",
          });
        }
      } else {
        req.body.role = "usuario";
      }

      const verifyusuario = await Usuario.findOne({
        where: { email: req.body.email },
        transaction,
      });

      if (verifyusuario) {
        await transaction.rollback();
        return res.status(400).send({ message: "E-mail já cadastrado!" });
      }

      const usuario = await Usuario.create(req.body, { transaction });

      const isPesquisador =
        req.body.area_atuacao ||
        req.body.instituicao_vinculo ||
        req.body.nivel_formacao;

      const isTecnico =
        req.body.especializacao ||
        req.body.registro_profissional ||
        req.body.disponibilidade;

      let tipo = "usuario";

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

      return res.status(201).send({ message: "Usuário criado com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({ error: "Erro ao criar usuário." });
    }
  }

  async update(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const {
        nome,
        email,
        old_password,
        new_password,
        confirm_password,
        especializacao,
        disponibilidade,
        id_telefone,
        telefone,
        registro_profissional,
        area_atuacao,
        instituicao_vinculo,
        nivel_formacao,
        role,
      } = req.body;

      const targetUserId = req.userRole === "admin" ? req.params.id : req.newId;
      const loggedUserRole = req.userRole;

      if (role && loggedUserRole !== "admin") {
        await transaction.rollback();
        return res.status(403).json({
          message: "Você não tem permissão para alterar privilégios.",
        });
      }

      if (
        loggedUserRole === "admin" &&
        req.newId == targetUserId &&
        role === "usuario"
      ) {
        await transaction.rollback();
        return res.status(403).json({
          message: "Um administrador não pode remover seu próprio privilégio.",
        });
      }

      const usuario = await Usuario.findOne({
        where: { id_usuario: targetUserId },
        include: [
          { model: Pesquisador, as: "pesquisador" },
          { model: Tecnico, as: "tecnico" },
          { model: TelefoneContato, as: "telefones" },
        ],
        transaction,
      });

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).send({ message: "Usuário não encontrado." });
      }

      const CamposPesquisador =
        area_atuacao || instituicao_vinculo || nivel_formacao;

      const CamposTecnico =
        especializacao || disponibilidade || registro_profissional;

      if (usuario.tecnico && CamposPesquisador) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Usuário técnico não pode atualizar campos de pesquisador.",
        });
      }

      if (usuario.pesquisador && CamposTecnico) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Usuário pesquisador não pode atualizar campos de técnico.",
        });
      }

      if (
        usuario.role === "admin" &&
        role === "usuario" &&
        req.newId !== targetUserId
      ) {
        await transaction.rollback();
        return res.status(403).json({
          message: "Você não pode rebaixar outro administrador.",
        });
      }

      let encryptedPassword = "";

      if (old_password) {
        if (!(await usuario.checkPassword(old_password))) {
          await transaction.rollback();
          return res.status(401).send({ message: "Senha antiga incorreta." });
        }
        if (!new_password || !confirm_password) {
          await transaction.rollback();
          return res
            .status(400)
            .send({ message: "Nova senha e confirmação são obrigatórias." });
        }
        if (new_password !== confirm_password) {
          await transaction.rollback();
          return res
            .status(400)
            .send({ message: "Nova senha e confirmação não coincidem." });
        }
        encryptedPassword = await bcryptjs.hash(new_password, 8);
      }
      await Usuario.update(
        {
          nome: nome || usuario.nome,
          email: email || usuario.email,
          senha_hash: encryptedPassword || usuario.senha_hash,
          role: role ?? usuario.role,
        },
        { where: { id_usuario: targetUserId }, transaction }
      );
      if (telefone) {
        if (id_telefone) {
          await TelefoneContato.update(
            { telefone_contato: telefone },
            { where: { id_telefone, id_usuario: targetUserId }, transaction }
          );
        } else {
          await TelefoneContato.create(
            { id_usuario: targetUserId, telefone_contato: telefone },
            { transaction }
          );
        }
      }
      if (usuario.tecnico) {
        await Tecnico.update(
          {
            especializacao: especializacao || usuario.tecnico.especializacao,
            disponibilidade: disponibilidade || usuario.tecnico.disponibilidade,
            registro_profissional:
              registro_profissional || usuario.tecnico.registro_profissional,
          },
          {
            where: { id_usuario: targetUserId },
            transaction,
          }
        );
      } else if (usuario.pesquisador) {
        await Pesquisador.update(
          {
            area_atuacao: area_atuacao || usuario.pesquisador.area_atuacao,
            instituicao_vinculo:
              instituicao_vinculo || usuario.pesquisador.instituicao_vinculo,
            nivel_formacao:
              nivel_formacao || usuario.pesquisador.nivel_formacao,
          },
          {
            where: { id_usuario: targetUserId },
            transaction,
          }
        );
      }

      await transaction.commit();
      return res
        .status(200)
        .send({ message: "Usuário atualizado com sucesso!", usuario });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({ error: "Erro ao atualizar usuário." });
    }
  }
}

module.exports = new UserControllers();
