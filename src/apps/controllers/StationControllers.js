const EstacaoMonitoramento = require("../models/EstacaoMonitoramento");
const Trabalha = require("../models/Trabalha");
const Tecnico = require("../models/Tecnico");
const Sensor = require("../models/Sensor");
const database = require("../../database");

const sequelize = database.connection;

class StationControllers {
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const {
        nome_estacao,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        latitude,
        longitude,
        tecnicos_ids, // opcional: array de id_usuario de técnicos
      } = req.body;

      const estacao = await EstacaoMonitoramento.create(
        {
          nome_estacao,
          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          latitude,
          longitude,
        },
        { transaction }
      );

      if (Array.isArray(tecnicos_ids) && tecnicos_ids.length > 0) {
        const tecnicos = await Tecnico.findAll({
          where: { id_usuario: tecnicos_ids },
          transaction,
        });

        if (tecnicos.length !== tecnicos_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            message:
              "Um ou mais técnicos informados não existem. Verifique os IDs.",
          });
        }

        const registrosTrabalha = tecnicos_ids.map((idUsuarioTecnico) => ({
          id_tecnico: idUsuarioTecnico, // referencia tecnicos.id_usuario
          id_estacao: estacao.id_estacao,
        }));

        await Trabalha.bulkCreate(registrosTrabalha, { transaction });
      }

      await transaction.commit();

      return res
        .status(201)
        .json({ message: "Estação criada com sucesso!", estacao });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar estação." });
    }
  }

  async update(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        nome_estacao,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        latitude,
        longitude,
      } = req.body;

      const estacao = await EstacaoMonitoramento.findByPk(id, { transaction });

      if (!estacao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Estação não encontrada." });
      }

      await EstacaoMonitoramento.update(
        {
          nome_estacao: nome_estacao || estacao.nome_estacao,
          cep: cep || estacao.cep,
          logradouro: logradouro || estacao.logradouro,
          numero: numero || estacao.numero,
          bairro: bairro || estacao.bairro,
          cidade: cidade || estacao.cidade,
          estado: estado || estacao.estado,
          latitude: latitude || estacao.latitude,
          longitude: longitude || estacao.longitude,
        },
        {
          where: { id_estacao: id },
          transaction,
        }
      );

      await estacao.reload({ transaction });

      await transaction.commit();

      return res.status(200).json({
        message: "Estação atualizada com sucesso!",
        estacao,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar estação." });
    }
  }

  async index(req, res) {
    try {
      const estacoes = await EstacaoMonitoramento.findAll();
      return res.status(200).json(estacoes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar estações." });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const estacao = await EstacaoMonitoramento.findOne({
        where: { id_estacao: id },
        include: [
          {
            model: Sensor,
            as: "sensores",
          },
          {
            model: Tecnico,
            as: "tecnicos",
            through: { attributes: [] },
          },
        ],
      });

      if (!estacao) {
        return res.status(404).json({ message: "Estação não encontrada." });
      }

      return res.status(200).json(estacao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar estação." });
    }
  }

  async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const estacao = await EstacaoMonitoramento.findByPk(id, { transaction });

      if (!estacao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Estação não encontrada." });
      }

      await EstacaoMonitoramento.destroy({
        where: { id_estacao: id },
        transaction,
      });

      await transaction.commit();

      return res
        .status(200)
        .json({ message: "Estação deletada com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar estação." });
    }
  }

  async addWorker(req, res) { // Adiciona um técnico à estação (tabela Trabalha)
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params; // id da estação
      const { id_tecnico } = req.body; // id_usuario do técnico

      const estacao = await EstacaoMonitoramento.findByPk(id, { transaction });
      if (!estacao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Estação não encontrada." });
      }

      const tecnico = await Tecnico.findOne({
        where: { id_usuario: id_tecnico },
        transaction,
      });

      if (!tecnico) {
        await transaction.rollback();
        return res.status(404).json({ message: "Técnico não encontrado." });
      }

      const jaExiste = await Trabalha.findOne({
        where: { id_estacao: id, id_tecnico },
        transaction,
      });

      if (jaExiste) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Este técnico já está vinculado à estação.",
        });
      }

      await Trabalha.create(
        { id_estacao: id, id_tecnico },
        { transaction }
      );

      await transaction.commit();

      return res
        .status(201)
        .json({ message: "Técnico vinculado à estação com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao adicionar técnico à estação." });
    }
  }

  async removeWorker(req, res) {  // Remove vínculo de um técnico com a estação
    const transaction = await sequelize.transaction();
    try {
      const { id, id_tecnico } = req.params; 

      const registro = await Trabalha.findOne({
        where: { id_estacao: id, id_tecnico },
        transaction,
      });

      if (!registro) {
        await transaction.rollback();
        return res.status(404).json({
          message: "Este técnico não está vinculado a esta estação.",
        });
      }

      await Trabalha.destroy({
        where: { id_estacao: id, id_tecnico },
        transaction,
      });

      await transaction.commit();

      return res
        .status(200)
        .json({ message: "Técnico removido da estação com sucesso!" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao remover técnico da estação." });
    }
  }

}

module.exports = new StationControllers();
