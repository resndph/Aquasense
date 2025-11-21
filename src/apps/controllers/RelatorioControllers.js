const Relatorio = require("../models/Relatorio");
const AcaoCorretiva = require("../models/AcaoCorretiva");
const Atuacao = require("../models/Atuacao");
const Tecnico = require("../models/Tecnico");
const Alerta = require("../models/Alerta");
const Pesquisador = require("../models/Pesquisador");
const Usuario = require("../models/Usuario");
const Sensor = require("../models/Sensor");
const Trabalha = require("../models/Trabalha");

const database = require("../../database");
const sequelize = database.connection;

class RelatorioController {
  async create(req, res) { // Cria um novo relatório com ações corretivas e técnicos associados e verifica se os técnicos trabalham na estação do alerta
    const transaction = await sequelize.transaction();
    try {
      const {
        alerta_analisado,
        titulo,
        descricao,
        acoes_corretivas
      } = req.body;

      const pesquisador_resp = req.newId;

      const alerta = await Alerta.findOne({
        where: { id_alerta: alerta_analisado },
        transaction,
      });

      if (!alerta) {
        await transaction.rollback();
        return res.status(404).json({ message: "Alerta analisado não encontrado." });
      }

      // Buscar sensor e estação do alerta
      const sensor = await Sensor.findOne({
        where: { id_sensor: alerta.id_sensor },
        transaction,
      });

      if (!sensor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sensor do alerta não encontrado." });
      }

      const id_estacao = sensor.id_estacao_situado;

      const relatorio = await Relatorio.create({
        pesquisador_resp,
        alerta_analisado,
        titulo,
        descricao,
      }, { transaction });

      // Cria ações corretivas e valida técnicos
      if (Array.isArray(acoes_corretivas) && acoes_corretivas.length > 0) {
        for (const acao of acoes_corretivas) {
          const novaAcao = await AcaoCorretiva.create({
            relatorio_autor: relatorio.id_relatorio,
            descricao_acao: acao.descricao_acao,
            status_acao: "Pendente",
          }, { transaction });

          if (Array.isArray(acao.trabalhadores)) {
            for (const id_tecnico of acao.trabalhadores) {

              const tecnico = await Tecnico.findOne({
                where: { id_usuario: id_tecnico },
                transaction,
              });

              if (!tecnico) {
                await transaction.rollback();
                return res.status(400).json({
                  message: `O usuário ${id_tecnico} não existe ou não é um técnico.`
                });
              }

              // Verifica se trabalha na estação do alerta
              const trabalha = await Trabalha.findOne({
                where: {
                  id_tecnico,
                  id_estacao: id_estacao,
                },
                transaction,
              });

              if (!trabalha) {
                await transaction.rollback();
                return res.status(403).json({
                  message: `O técnico ${id_tecnico} não está alocado na estação responsável pelo alerta analisado.`
                });
              }

              await Atuacao.create({
                id_acao: novaAcao.id_acao,
                id_tecnico,
              }, { transaction });
            }
          }
        }
      }

      await transaction.commit();
      return res.status(201).json({
        message: "Relatório criado com sucesso!",
        relatorio
      });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar relatório." });
    }
  }

  async update(req, res) { // Atualiza um relatório existente
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { titulo, descricao } = req.body;

      const relatorio = await Relatorio.findOne({
        where: { id_relatorio: id },
        transaction,
      });

      if (!relatorio) {
        await transaction.rollback();
        return res.status(404).json({ message: "Relatório não encontrado." });
      }

      await Relatorio.update({
        titulo: titulo || relatorio.titulo,
        descricao: descricao || relatorio.descricao,
      }, {
        where: { id_relatorio: id },
        transaction
      });

      await transaction.commit();
      return res.status(200).json({ message: "Relatório atualizado com sucesso!" });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar relatório." });
    }
  }

  async index(req, res) {
  try {
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    if (loggedRole === "admin") {
      const relatorios = await Relatorio.findAll({
        include: [
          {
            model: AcaoCorretiva,
            as: "acoes_corretivas",
            attributes: ["id_acao", "descricao_acao", "status_acao", "data_execucao"],
          },
          {
            model: Usuario,
            as: "pesquisador_usuario",
            attributes: ["nome"]
          },
          {
            model: Pesquisador,
            as: "pesquisador",
            attributes: ["id_usuario", "area_atuacao", "instituicao_vinculo", "nivel_formacao"]
          }
        ],
      });

      return res.status(200).json(relatorios);
    }

    const tecnico = await Tecnico.findOne({
      where: { id_usuario: loggedUserId }
    });

    if (!tecnico) {
      const relatorios = await Relatorio.findAll({
        include: [
          {
            model: AcaoCorretiva,
            as: "acoes_corretivas",
            attributes: ["id_acao", "descricao_acao", "status_acao", "data_execucao"],
          },
          {
            model: Usuario,
            as: "pesquisador_usuario",
            attributes: ["nome"]
          },
          {
            model: Pesquisador,
            as: "pesquisador",
            attributes: ["id_usuario", "area_atuacao", "instituicao_vinculo", "nivel_formacao"]
          }
        ],
      });

      return res.status(200).json(relatorios);
    }

    const estacoes = await Trabalha.findAll({
      where: { id_tecnico: loggedUserId },
      attributes: ["id_estacao"]
    });

    if (estacoes.length === 0) {
      return res.status(200).json([]);
    }

    const idsEstacoes = estacoes.map(e => e.id_estacao);

    const relatorios = await Relatorio.findAll({
      include: [
        {
          model: Alerta,
          as: "alerta",
          include: [
            {
              model: Sensor,
              as: "sensor",
              where: { id_estacao_situado: idsEstacoes },
              required: true
            }
          ]
        },
        {
          model: AcaoCorretiva,
          as: "acoes_corretivas",
          attributes: ["id_acao", "descricao_acao", "status_acao", "data_execucao"],
        }
      ]
    });

    return res.status(200).json(relatorios);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar relatórios." });
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
        // Buscar estações onde o técnico trabalha
        const estacoes = await Trabalha.findAll({
          where: { id_tecnico: loggedUserId },
          attributes: ["id_estacao"]
        });

        const idsEstacoes = estacoes.map(e => e.id_estacao);

        // Verifica se este relatório pertence a uma dessas estações
        const permitido = await Relatorio.findOne({
          where: { id_relatorio: id },
          include: [
            {
              model: Alerta,
              as: "alerta",
              include: [
                {
                  model: Sensor,
                  as: "sensor",
                  where: { id_estacao_situado: idsEstacoes },
                  required: true
                }
              ]
            }
          ]
        });

        if (!permitido) {
          return res.status(403).json({
            message: "Você não tem permissão para acessar este relatório."
          });
        }
      }
    }

    const relatorio = await Relatorio.findOne({
      where: { id_relatorio: id },
      include: [
        {    // Agora busca o relatório com todos os includes

          model: AcaoCorretiva,
          as: "acoes_corretivas",
          include: [
            {
              model: Atuacao,
              as: "atuacoes",
              include: [{ model: Tecnico, as: "tecnico" }]
            }
          ]
        },
        { model: Alerta, as: "alerta" },
        {
          model: Usuario,
          as: "pesquisador_usuario",
          attributes: ["nome"]
        },
        {
          model: Pesquisador,
          as: "pesquisador",
          attributes: ["id_usuario", "area_atuacao", "instituicao_vinculo", "nivel_formacao"]
        }
      ],
    });

    if (!relatorio) {
      return res.status(404).json({ message: "Relatório não encontrado." });
    }

    return res.status(200).json(relatorio);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar relatório." });
  }
  }

  async delete(req, res) { // Deleta um relatório
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const relatorio = await Relatorio.findOne({
        where: { id_relatorio: id },
        transaction,
      });

      if (!relatorio) {
        await transaction.rollback();
        return res.status(404).json({ message: "Relatório não encontrado." });
      }

      await Relatorio.destroy({
        where: { id_relatorio: id },
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Relatório deletado com sucesso!" });

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({
        error: "Erro ao deletar relatório. Ações corretivas podem impedir a remoção (RESTRICT).",
      });
    }
  }
}

module.exports = new RelatorioController();
