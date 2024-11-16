from flask import Flask, jsonify
from flasgger import Swagger
from utils import get_random_int

# OpenTelemetry
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry import trace 
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry import metrics
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter


provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))

# Sets the global default tracer provider
trace.set_tracer_provider(provider)

# Acquire a tracer
tracer = trace.get_tracer("flight-app-py.tracer")

# Acquire a meter.
meter = metrics.get_meter("flight-app-py.meter")

# custom counter metric that increments upon each call to the root endpoint
counter = meter.create_counter("root_endpoint.counter", description="Counts the number of times the root endpoint is invoked")

app = Flask(__name__)
Swagger(app)

FlaskInstrumentor().instrument_app(app)

AIRLINES = ["AA", "UA", "DL"]

@app.route("/")
def home():
    """No-op home endpoint
    ---
    responses:
      200:
        description: Returns ok
    """
    counter.add(1)
    return jsonify({"message": "ok"})


@app.route("/airlines/<err>")
def get_airlines(err=None):
    """Get airlines endpoint. Set err to "raise" to trigger an exception.
    ---
    parameters:
      - name: err
        in: path
        type: string
        enum: ["raise"]
        required: false
    responses:
      200:
        description: Returns a list of airlines
    """
    if err == "raise":
        raise Exception("Raise test exception")
    return jsonify({"airlines": AIRLINES})

@app.route("/flights/<airline>/<err>")
def get_flights(airline, err=None):
    """Get flights endpoint. Set err to "raise" to trigger an exception.
    ---
    parameters:
      - name: airline
        in: path
        type: string
        enum: ["AA", "UA", "DL"]
        required: true
      - name: err
        in: path
        type: string
        enum: ["raise"]
        required: false
    responses:
      200:
        description: Returns a list of flights for the selected airline
    """
    # This creates a new span that's the child of the current one
    with tracer.start_as_current_span("get_flights") as get_flights_span:
        if err == "raise":
            raise Exception("Raise test exception")
        random_int = get_random_int(100, 999)
        get_flights_span.set_attribute("get_flights.airline", airline)
        get_flights_span.set_attribute("get_flights.airline.random_int", random_int)
        return jsonify({airline: [random_int]})

if __name__ == "__main__":
    app.run(debug=True)
