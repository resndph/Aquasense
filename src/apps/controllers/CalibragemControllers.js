const Calibragem = require("../models/Calibragem");
const Sensor = require("../models/Sensor");
const Tecnico = require("../models/Tecnico");
const EstacaoMonitoramento = require("../models/EstacaoMonitoramento");
const Trabalha = require("../models/Trabalha");

const database = require("../../database");
const sequelize = database.connection;

class CalibragemController {
    async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
    const { id_sensor } = req.body;
    const loggedUserId = req.newId;

    const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId },
        transaction
    });

    if (!tecnico) {
        await transaction.rollback();
        return res.status(403).json({
        message: "Somente técnicos podem registrar calibragens."
        });
    }

    const sensor = await Sensor.findOne({
        where: { id_sensor },
        transaction,
        include: [{ model: EstacaoMonitoramento, as: "estacao" }]
    });

    if (!sensor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sensor não encontrado." });
    }

    const trabalha = await Trabalha.findOne({
        where: {
        id_tecnico: loggedUserId,
        id_estacao: sensor.id_estacao_situado
        },
        transaction
    });

    if (!trabalha) {
        await transaction.rollback();
        return res.status(403).json({
        message:
            "Você não pode calibrar um sensor de uma estação em que não está vinculado."
        });
    }

    const calibragem = await Calibragem.create(
        {
        id_tecnico: loggedUserId,
        id_sensor
        },
        { transaction }
    );

    await transaction.commit();
    return res.status(201).json({
        message: "Calibragem registrada com sucesso!",
        calibragem
    });
    } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar calibragem." });
    }
    }

    async index(req, res) {
    try {
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    if (loggedRole === "admin") {
        const calibragens = await Calibragem.findAll({
        include: [
            { model: Tecnico, as: "tecnico" },
            {
            model: Sensor,
            as: "sensor",
            include: [{ model: EstacaoMonitoramento, as: "estacao" }]
            }
        ]
        });

        return res.status(200).json(calibragens);
    }

    const calibragens = await Calibragem.findAll({
        where: { id_tecnico: loggedUserId },
        include: [
        { model: Tecnico, as: "tecnico" },
        {
            model: Sensor,
            as: "sensor",
            include: [{ model: EstacaoMonitoramento, as: "estacao" }]
        }
        ]
    });

    return res.status(200).json(calibragens);

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar calibragens." });
    }
    }

    async show(req, res) {
    try {
    const { id_tecnico, id_sensor } = req.params;
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    const calibragem = await Calibragem.findOne({
        where: { id_tecnico, id_sensor },
        include: [
        { model: Tecnico, as: "tecnico" },
        {
            model: Sensor,
            as: "sensor",
            include: [{ model: EstacaoMonitoramento, as: "estacao" }]
        }
        ]
    });

    if (!calibragem) {
        return res.status(404).json({ message: "Calibragem não encontrada." });
    }

    if (loggedRole === "admin") {
        return res.status(200).json(calibragem);
    }

    if (parseInt(id_tecnico) !== loggedUserId) {
        return res.status(403).json({
        message: "Você não tem permissão para acessar esta calibragem."
        });
    }

    return res.status(200).json(calibragem);

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar calibragem." });
    }
    }

    async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
    const { id_tecnico, id_sensor } = req.params;
    const loggedUserId = req.newId;
    const loggedRole = req.userRole;

    const calibragem = await Calibragem.findOne({
        where: { id_tecnico, id_sensor },
        transaction
    });

    if (!calibragem) {
        await transaction.rollback();
        return res.status(404).json({ message: "Calibragem não encontrada." });
    }

    if (loggedRole !== "admin") {

        if (parseInt(id_tecnico) !== loggedUserId) {
        await transaction.rollback();
        return res.status(403).json({
            message: "Você não tem permissão para deletar esta calibragem."
        });
        }
    }

    await Calibragem.destroy({
        where: { id_tecnico, id_sensor },
        transaction
    });

    await transaction.commit();
    return res.status(200).json({
        message: "Calibragem deletada com sucesso!"
    });

    } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: "Erro ao deletar calibragem." });
    }
    }
}

module.exports = new CalibragemController();
