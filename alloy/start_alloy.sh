source .env
#../../alloy/alloy-darwin-arm64 run ../pov-sim/alloy/config.alloy
docker run --name=alloy -v ./config.alloy:/etc/alloy/config.alloy \
  -p 12345:12345 -p 4317:4317 -p 4318:4318 \
  grafana/alloy:latest \
    run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy
