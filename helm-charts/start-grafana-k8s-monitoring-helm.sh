source .env
helm repo add grafana https://grafana.github.io/helm-charts &&
  helm repo update &&
  helm upgrade --install --version ^1 --atomic --timeout 300s grafana-k8s-monitoring grafana/k8s-monitoring \
    --namespace "monitoring" --create-namespace --values - <<EOF
cluster:
  name: k8s-mon-cluster
externalServices:
  prometheus:
    host: https://prometheus-us-central1.grafana.net
    basicAuth:
      username: "1010169"
      password: ${GRAFANA_STACK_PROMETHEUS_PASSWORD}
  loki:
    host: https://logs-prod-017.grafana.net
    basicAuth:
      username: "607690"
      password: ${GRAFANA_STACK_LOKI_PASSWORD}
  tempo:
    host: https://tempo-us-central1.grafana.net:443
    basicAuth:
      username: "604202"
      password: ${GRAFANA_STACK_TEMPO_PASSWORD}
metrics:
  enabled: true
  alloy:
    metricsTuning:
      useIntegrationAllowList: true
  cost:
    enabled: true
  kepler:
    enabled: true
  node-exporter:
    enabled: true
  beyla:
    enabled: true
logs:
  enabled: true
  pod_logs:
    enabled: true
  cluster_events:
    enabled: true
traces:
  enabled: true
receivers:
  grpc:
    enabled: true
  http:
    enabled: true
  zipkin:
    enabled: false
  grafanaCloudMetrics:
    enabled: true
opencost:
  enabled: true
  opencost:
    exporter:
      defaultClusterId: k8s-mon-cluster
    prometheus:
      external:
        url: https://prometheus-us-central1.grafana.net/api/prom
kube-state-metrics:
  enabled: true
prometheus-node-exporter:
  enabled: true
prometheus-operator-crds:
  enabled: true
kepler:
  enabled: true
alloy: {}
alloy-events: {}
alloy-logs: {}
beyla:
  enabled: true
EOF
