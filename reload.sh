influx delete --bucket radio_new2  --start '1970-01-01T00:00:00Z' --stop '2070-01-01T00:00:00Z'
echo 0 > wateermarks/influx.watermark.json
echo 0 > watermarks/influx.transition.watermark.json
node influx.js
node influx_transitions.js
