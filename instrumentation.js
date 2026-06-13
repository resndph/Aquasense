const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// Força o OpenTelemetry a imprimir qualquer erro de rede no console
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Forçando a resolução pelo nome exato do container do Jaeger
const traceExporter = new OTLPTraceExporter({
  url: 'http://jaegercontainer:4318/v1/traces'
});

const sdk = new opentelemetry.NodeSDK({
  serviceName: 'aquasense-api',
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
console.log('🚀 OpenTelemetry inicializado com sucesso.');