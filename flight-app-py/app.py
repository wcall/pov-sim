from flask import Flask, jsonify
from flasgger import Swagger
from utils import get_random_int

####  OpenTelemetry traces configuration  ######################################
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.trace import set_tracer_provider
tracer_provider = TracerProvider()
tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
# Sets the global default tracer provider
set_tracer_provider(tracer_provider)

# Use custom tracer
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
tracer = trace.get_tracer(__name__)

####  OpenTelemetry metrics configuration  #####################################
from opentelemetry.metrics import get_meter_provider, set_meter_provider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter, PeriodicExportingMetricReader
meter_provider = MeterProvider(metric_readers=[
    PeriodicExportingMetricReader(ConsoleMetricExporter(), export_interval_millis=5000)
])
set_meter_provider(meter_provider)

# Create two custom metrics: counter and histogram
meter = get_meter_provider().get_meter('custom_meter')
# custom counter metric that increments upon each call to the root endpoint
counter = meter.create_counter("root_endpoint.counter", description="Counts the number of times the root endpoint is invoked")
histogram = meter.create_histogram('custom_histogram')

####  OpenTelemetry logs configuration  ########################################
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogExporter
logger_provider = LoggerProvider()
logger_provider.add_log_record_processor(BatchLogRecordProcessor(ConsoleLogExporter()))
# Sets the global default logger provider
set_logger_provider(logger_provider)

# Logging instrumentation
import logging
handler = LoggingHandler(logger_provider=logger_provider)
logger = logging.getLogger()
logger.addHandler(handler)

app = Flask(__name__)
Swagger(app)

# Flask auto-instrumentation
from opentelemetry.instrumentation.flask import FlaskInstrumentor
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
            parent_span.add_event('error in get_flights', { 'airline': airline })
            parent_span.set_status(Status(StatusCode.ERROR))
        random_int = get_random_int(100, 999)
        parent_span = trace.get_current_span()
        parent_span.add_event('in get_flights', { 'airline': airline })
        parent_span.set_status(Status(StatusCode.OK))
        get_flights_span.set_attribute("get_flights.airline", airline)
        get_flights_span.set_attribute("get_flights.airline.random_int", random_int)
        histogram.record(random_int, attributes={ 'get_flights.airline': airline })
        return jsonify({airline: [random_int]})

if __name__ == "__main__":
    app.run(debug=True)
