const Alerta = require("../models/Alerta");
const Leitura = require("../models/Leitura");
const Sensor = require("../models/Sensor");
const EstacaoMonitoramento = require("../models/EstacaoMonitoramento");
const Tecnico = require("../models/Tecnico");
const Trabalha = require("../models/Trabalha");

const database = require("../../database");
const sequelize = database.connection;

class AlertController {
    async index(req, res) {
    try {
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    if (loggedRole === "admin") {
        const alertas = await Alerta.findAll({
        include: [
            {
            model: Leitura,
            as: "leitura",
            include: [
                {
                model: Sensor,
                as: "sensor",
                include: [{ model: EstacaoMonitoramento, as: "estacao" }]
                }
            ]
            }
        ]
        });
        return res.status(200).json(alertas);
    }

    const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId }
    });

    if (!tecnico) {
        const alertas = await Alerta.findAll({
        include: [
            {
            model: Leitura,
            as: "leitura",
            include: [
                {
                model: Sensor,
                as: "sensor",
                include: [{ model: EstacaoMonitoramento, as: "estacao" }]
                }
            ]
            }
        ]
        });

        return res.status(200).json(alertas);
    }

    const estacoes = await Trabalha.findAll({
        where: { id_tecnico: loggedUserId },
        attributes: ["id_estacao"]
    });

    const idsEstacoes = estacoes.map(e => e.id_estacao);

    if (idsEstacoes.length === 0) {
        return res.status(200).json([]);
    }

    const alertas = await Alerta.findAll({
        include: [
        {
            model: Leitura,
            as: "leitura",
            required: true,
            include: [
            {
                model: Sensor,
                as: "sensor",
                required: true,
                where: { id_estacao_situado: idsEstacoes },
                include: [{ model: EstacaoMonitoramento, as: "estacao" }]
            }
            ]
        }
        ]
    });

    return res.status(200).json(alertas);

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar alertas." });
    }
    }

    async show(req, res) {
    try {
    const { id } = req.params;
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    const alerta = await Alerta.findOne({
        where: { id_alerta: id },
        include: [
        {
            model: Leitura,
            as: "leitura",
            include: [
            {
                model: Sensor,
                as: "sensor",
                include: [{ model: EstacaoMonitoramento, as: "estacao" }]
            }
            ]
        }
        ]
    });

    if (!alerta) {
        return res.status(404).json({ message: "Alerta não encontrado." });
    }

    if (loggedRole === "admin") {
        return res.status(200).json(alerta);
    }

    const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId }
    });

    if (!tecnico) {
        return res.status(200).json(alerta);
    }

    const idEstacao = alerta.leitura.sensor.id_estacao_situado;

    const vinculo = await Trabalha.findOne({
        where: {
        id_tecnico: loggedUserId,
        id_estacao: idEstacao
        }
    });

    if (!vinculo) {
        return res.status(403).json({
        message: "Você não tem permissão para acessar este alerta."
        });
    }

    return res.status(200).json(alerta);

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar alerta." });
    }
    }

    async update(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { tipo_alerta, nivel_severidade, descricao_alerta } = req.body;

        const alerta = await Alerta.findOne({
        where: { id_alerta: id },
        transaction
        });

        if (!alerta) {
        await transaction.rollback();
        return res.status(404).json({ message: "Alerta não encontrado." });
        }

        await Alerta.update(
        {
            tipo_alerta: tipo_alerta || alerta.tipo_alerta,
            nivel_severidade: nivel_severidade || alerta.nivel_severidade,
            descricao_alerta: descricao_alerta || alerta.descricao_alerta
        },
        { where: { id_alerta: id }, transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: "Alerta atualizado com sucesso!" });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ error: "Erro ao atualizar alerta." });
    }
    }

    async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const alerta = await Alerta.findOne({
        where: { id_alerta: id },
        transaction
        });

        if (!alerta) {
        await transaction.rollback();
        return res.status(404).json({ message: "Alerta não encontrado." });
        }

        await Alerta.destroy({
        where: { id_alerta: id },
        transaction
        });

        await transaction.commit();
        return res.status(200).json({ message: "Alerta deletado com sucesso!" });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ error: "Erro ao deletar alerta." });
    }
    }
}

module.exports = new AlertController();
