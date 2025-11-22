const Leitura = require("../models/Leitura");
const Sensor = require("../models/Sensor");
const EstacaoMonitoramento = require("../models/EstacaoMonitoramento");
const Trabalha = require("../models/Trabalha");
const Tecnico = require("../models/Tecnico");
const Alerta = require("../models/Alerta");

const database = require("../../database");
const sequelize = database.connection;

class LeituraController {
    async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
    const { id_sensor_autor, valor } = req.body;

    const sensor = await Sensor.findOne({
        where: { id_sensor: id_sensor_autor },
        transaction,
    });

    if (!sensor) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sensor não encontrado." });
    }

    const leitura = await Leitura.create(
        {
        id_sensor_autor,
        valor,
        },
        { transaction }
    );

    if (sensor.limite !== null && valor > sensor.limite) {
        await Alerta.create(
        {
            leitura_causa: leitura.id_leitura,
            tipo_alerta: "Limite excedido",
            nivel_severidade: "Crítico", // default do model
            descricao_alerta: `Leitura de ${valor} ultrapassou o limite do sensor (${sensor.limite}).`
        },
        { transaction }
        );
    }

    await transaction.commit();
    return res.status(201).json({
        message: "Leitura registrada com sucesso!",
        leitura,
    });

    } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar leitura." });
    }
    }

    async index(req, res) {
    try {
        const loggedUserId = req.newId;
        const loggedRole = req.userRole;

        const tecnico = await Tecnico.findOne({
        where: { id_usuario: loggedUserId },
        });

        if (loggedRole !== "admin") {
        if (tecnico) {
            const estacoesTecnico = await Trabalha.findAll({
            where: { id_tecnico: loggedUserId },
            attributes: ["id_estacao"],
            });

            if (estacoesTecnico.length === 0) {
            return res.status(200).json([]);
            }

            const idsEstacoes = estacoesTecnico.map((e) => e.id_estacao);

            const leituras = await Leitura.findAll({
            include: [
                {
                model: Sensor,
                as: "sensor",
                where: { id_estacao_situado: idsEstacoes },
                include: [
                    {
                    model: EstacaoMonitoramento,
                    as: "estacao",
                    },
                ],
                },
            ],
            });

            return res.status(200).json(leituras);
        }
        }
        
        const leituras = await Leitura.findAll({
        include: [
            {
            model: Sensor,
            as: "sensor",
            include: [
                {
                model: EstacaoMonitoramento,
                as: "estacao",
                },
            ],
            },
        ],
        });

        return res.status(200).json(leituras);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao listar leituras." });
    }
    }

    async show(req, res) {
    try {
        const { id } = req.params;
        const loggedUserId = req.newId;
        const loggedRole = req.userRole; 

        const leitura = await Leitura.findOne({
        where: { id_leitura: id },
        include: [
            {
            model: Sensor,
            as: "sensor",
            include: [
                {
                model: EstacaoMonitoramento,
                as: "estacao",
                },
            ],
            },
        ],
        });

        if (!leitura) {
        return res.status(404).json({ message: "Leitura não encontrada." });
        }

        if (loggedRole !== "admin") {

        const tecnico = await Tecnico.findOne({
            where: { id_usuario: loggedUserId },
        });

        if (tecnico) {
            const idEstacao = leitura.sensor.id_estacao_situado;

            const trabalha = await Trabalha.findOne({
            where: {
                id_tecnico: loggedUserId,
                id_estacao: idEstacao,
            },
            });

            if (!trabalha) {
            return res.status(403).json({
                message:
                "Você não tem permissão para acessar esta leitura (estação não vinculada ao seu usuário).",
            });
            }
        }
        }

        return res.status(200).json(leitura);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao buscar leitura." });
    }
    }

    async delete(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const leitura = await Leitura.findOne({
        where: { id_leitura: id },
        transaction,
        });

        if (!leitura) {
        await transaction.rollback();
        return res.status(404).json({ message: "Leitura não encontrada." });
        }

        await Leitura.destroy({
        where: { id_leitura: id },
        transaction,
        });

        await transaction.commit();
        return res.status(200).json({ message: "Leitura deletada com sucesso!" });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ error: "Erro ao deletar leitura." });
    }
    }
}

module.exports = new LeituraController();
