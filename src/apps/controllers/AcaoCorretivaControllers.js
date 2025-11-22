const AcaoCorretiva = require("../models/AcaoCorretiva");
const Relatorio = require("../models/Relatorio");
const Atuacao = require("../models/Atuacao");
const Tecnico = require("../models/Tecnico");
const Alerta = require("../models/Alerta");
const Sensor = require("../models/Sensor");
const Trabalha = require("../models/Trabalha");
const Leitura = require("../models/Leitura");

const database = require("../../database");
const sequelize = database.connection;

class AcaoCorretivaController {
  async index(req, res) {
  try {
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    const tecnico = await Tecnico.findOne({ where: { id_usuario: loggedUserId } });

    let acoes;

    if (tecnico && loggedRole !== 'admin') {
      acoes = await AcaoCorretiva.findAll({
        include: [
          { model: Relatorio, as: "relatorio" },
          {
            model: Atuacao,
            as: "atuacoes",
            where: { id_tecnico: loggedUserId },
            required: true
          }
        ]
      });

    } else {
      acoes = await AcaoCorretiva.findAll({
        include: [{ model: Relatorio, as: "relatorio" }]
      });
    }

    return res.status(200).json(acoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar ações corretivas." });
  }
  }

  async show(req, res) {
  try {
    const { id } = req.params;
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    if (loggedRole !== "admin") {
      const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId }
      });

      if (tecnico) {
        const atuacao = await Atuacao.findOne({
          where: {
            id_acao: id,
            id_tecnico: loggedUserId
          }
        });

        if (!atuacao) {
          return res.status(403).json({
            message: "Você não tem permissão para acessar esta ação corretiva."
          });
        }
      }
    }

    const acao = await AcaoCorretiva.findOne({
      where: { id_acao: id },
      include: [
        {
          model: Relatorio,
          as: "relatorio",
        },
        {
          model: Atuacao,
          as: "atuacoes",
          include: [
            {
              model: Tecnico,
              as: "tecnico",
            },
          ],
        },
      ],
    });

    if (!acao) {
      return res.status(404).json({ message: "Ação corretiva não encontrada." });
    }

    return res.status(200).json(acao);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar ação corretiva." });
  }
  }

  async update(req, res) { // Atualiza uma ação corretiva
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const { descricao_acao, status_acao, data_execucao } = req.body;

      const acao = await AcaoCorretiva.findOne({
        where: { id_acao: id },
        transaction,
      });

      if (!acao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Ação corretiva não encontrada." });
      }

      await AcaoCorretiva.update(
        {
          descricao_acao: descricao_acao || acao.descricao_acao,
          status_acao: status_acao || acao.status_acao,
          data_execucao: data_execucao || acao.data_execucao,
        },
        { where: { id_acao: id }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({ message: "Ação corretiva atualizada com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar ação corretiva." });
    }
  }

  async delete(req, res) { // Deleta uma ação corretiva
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const acao = await AcaoCorretiva.findOne({
        where: { id_acao: id },
        transaction,
      });

      if (!acao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Ação corretiva não encontrada." });
      }

      await AcaoCorretiva.destroy({
        where: { id_acao: id },
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Ação corretiva deletada com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar ação corretiva." });
    }
  }

  async addWorker(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; 
    const { id_tecnico } = req.body;

    const acao = await AcaoCorretiva.findOne({
      where: { id_acao: id },
      transaction
    });

    if (!acao) {
      await transaction.rollback();
      return res.status(404).json({ message: "Ação corretiva não encontrada." });
    }

    const relatorio = await Relatorio.findOne({
      where: { id_relatorio: acao.relatorio_autor },
      transaction,
    });

    if (!relatorio) {
      await transaction.rollback();
      return res.status(500).json({ message: "Relatório associado não encontrado." });
    }

    const alerta = await Alerta.findOne({
      where: { id_alerta: relatorio.alerta_analisado },
      transaction,
    });

    if (!alerta) {
      await transaction.rollback();
      return res.status(500).json({ message: "Alerta associado ao relatório não encontrado." });
    }

    const leitura = await Leitura.findOne({
      where: { id_leitura: alerta.leitura_causa },
      transaction,
    });

    if (!leitura) {
      await transaction.rollback();
      return res.status(500).json({ message: "Leitura associada ao alerta não encontrada." });
    }

    const sensor = await Sensor.findOne({
      where: { id_sensor: leitura.id_sensor_autor },
      transaction,
    });

    if (!sensor) {
      await transaction.rollback();
      return res.status(500).json({ message: "Sensor associado à leitura não encontrado." });
    }

    const id_estacao = sensor.id_estacao_situado;

    const tecnico = await Tecnico.findOne({
      where: { id_usuario: id_tecnico },
      transaction,
    });

    if (!tecnico) {
      await transaction.rollback();
      return res.status(400).json({ message: "Técnico não encontrado." });
    }

    const trabalha = await Trabalha.findOne({
      where: { id_tecnico, id_estacao },
      transaction,
    });

    if (!trabalha) {
      await transaction.rollback();
      return res.status(403).json({
        message: `O técnico ${id_tecnico} não está alocado na estação responsável pelo alerta analisado.`,
      });
    }

    const existe = await Atuacao.findOne({
      where: { id_acao: id, id_tecnico },
      transaction,
    });

    if (existe) {
      await transaction.rollback();
      return res.status(400).json({ message: "Técnico já está nesta ação." });
    }

    // 8) Criar atuação
    await Atuacao.create(
      {
        id_acao: id,
        id_tecnico,
      },
      { transaction }
    );

    await transaction.commit();
    
    return res.status(201).json({ message: "Técnico adicionado à ação." });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: "Erro ao adicionar técnico à ação." });
  }
  }

  async removeWorker(req, res) { // Remove um técnico de uma ação corretiva
    const transaction = await sequelize.transaction();
    try {
      const { id, id_tecnico } = req.params;

      const atuacao = await Atuacao.findOne({
        where: { id_acao: id, id_tecnico: id_tecnico },
        transaction,
      });

      if (!atuacao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Este técnico não está associado à ação." });
      }

      await Atuacao.destroy({
        where: { id_acao: id, id_tecnico: id_tecnico },
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Técnico removido da ação." });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao remover técnico da ação." });
    }
  }
}

module.exports = new AcaoCorretivaController();
