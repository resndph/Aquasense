const Sensor = require("../models/Sensor");
const EstacaoMonitoramento = require("../models/EstacaoMonitoramento");
const Trabalha = require("../models/Trabalha");
const Tecnico = require("../models/Tecnico");

const database = require("../../database");
const sequelize = database.connection;

class SensorController {
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { tipo, unidade_medida, limite, status_sensor, id_estacao_situado } = req.body;

      const estacao = await EstacaoMonitoramento.findByPk(id_estacao_situado, { transaction });

      if (!estacao) {
        await transaction.rollback();
        return res.status(404).json({ message: "Estação informada não existe." });
      }

      const sensor = await Sensor.create(
        {
          tipo,
          unidade_medida,
          limite,
          status_sensor,
          id_estacao_situado
        },
        { transaction }
      );

      await transaction.commit();
      return res.status(201).json({ message: "Sensor criado com sucesso!", sensor });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar sensor." });
    }
  }

  async index(req, res) {
  try {
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    let sensores;

    if(loggedRole !== 'admin'){
      const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId }
      });

      if (tecnico) {
        const estacoesTrabalhadas = await Trabalha.findAll({
          where: { id_tecnico: loggedUserId },
          attributes: ["id_estacao"]
        });

        const idsEstacoes = estacoesTrabalhadas.map(e => e.id_estacao);

        sensores = await Sensor.findAll({
          where: { id_estacao_situado: idsEstacoes },
          include: [
            {
              model: EstacaoMonitoramento,
              as: "estacao"
            }
          ]
        });

        return res.status(200).json(sensores);
      }
    }

    sensores = await Sensor.findAll({
      include: [
        {
          model: EstacaoMonitoramento,
          as: "estacao"
        }
      ]
    });

    return res.status(200).json(sensores);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar sensores." });
  }
  }

  async show(req, res) {
    try {
      const loggedRole = req.userRole;
      const { id } = req.params;
      const loggedUserId = req.newId;

      const sensor = await Sensor.findOne({
        where: { id_sensor: id },
        include: [
          {
            model: EstacaoMonitoramento,
            as: "estacao"
          }
        ]
      });

      if (!sensor) {
        return res.status(404).json({ message: "Sensor não encontrado." });
      }

      if (loggedRole !== 'admin') {
        const tecnico = await Tecnico.findOne({ where: { id_usuario: loggedUserId } });

        if (tecnico) {
          const trabalha = await Trabalha.findOne({
            where: {
              id_tecnico: loggedUserId,
              id_estacao: sensor.id_estacao_situado
            }
          });

          if (!trabalha) {
            return res.status(403).json({
              message: "Você não tem permissão para acessar este sensor."
            });
          }
        }
      }
      return res.status(200).json(sensor);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar sensor." });
    }
  }

  async update(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const sensor = await Sensor.findByPk(id, { transaction });

      if (!sensor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sensor não encontrado." });
      }

      const { tipo, unidade_medida, limite, status_sensor } = req.body;

      await Sensor.update(
        {
          tipo: tipo || sensor.tipo,
          unidade_medida: unidade_medida || sensor.unidade_medida,
          limite: limite || sensor.limite,
          status_sensor: status_sensor || sensor.status_sensor
        },
        { where: { id_sensor: id }, transaction }
      );

      await sensor.reload({ transaction });

      await transaction.commit();
      return res.status(200).json({
        message: "Sensor atualizado com sucesso!",
        sensor
      });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar sensor." });
    }
  }

  async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const sensor = await Sensor.findByPk(id, { transaction });

      if (!sensor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sensor não encontrado." });
      }

      await Sensor.destroy({ where: { id_sensor: id }, transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Sensor deletado com sucesso!" });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar sensor." });
    }
  }
}

module.exports = new SensorController();
