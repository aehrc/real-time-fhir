import logging
import sched
import time
import requests
from flask import Flask, request
from flask_socketio import SocketIO, emit
from datetime import datetime

from api.generator import Generator
from api.reader import Reader
from api.tablebuilder import TableBuilder

# change processing to when send event and not before sending
# fix errors in backend

s = sched.scheduler(time.time)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

reader = Reader()
token = reader.request_token()
gen = Generator(token)


@app.route("/resources/<resource_type>")
def find_resource(resource_type=None):
    # define url and GET resource payload
    url = f"***REMOVED***/fhir_r4/{resource_type}"
    url_params = request.query_string.decode("ascii")
    if len(url_params) > 1:
        url += "?" + url_params
    payload = reader.search_FHIR_data(url, token)
    error_msg = ""

    # return with error message if an error occured
    if payload["resourceType"] == "OperationOutcome":
        if payload["issue"][0]["severity"] == "error":
            return {
                "title": "",
                "url": url,
                "headers": [],
                "body": [],
                "error": payload["issue"][0]["diagnostics"],
            }

    # build resource table
    tb = TableBuilder(resource_type, payload)
    headers, data = tb.build_table()
    data = data.tolist()
    return {
        "title": resource_type,
        "url": url,
        "headers": headers,
        "body": data,
        "error": error_msg,
    }


@socketio.on("start_simulation")
def start_simulation(data):
    list(map(s.cancel, s.queue))
    print("Resource Type:", data["rtype"], "  Duration:", data["duration"])
    gen.set_rtype_and_duration(data["rtype"], data["duration"])
    events = gen.generate_events()
    send_events(events)


@socketio.on("stop_simulation")
def stop_simulation(data):
    list(map(s.cancel, s.queue))
    gen.reset_variables()


# start timer and send events to FHIR client
def send_events(events):
    url = "http://localhost:8080/fhir/"
    emit("sendEvents", (len(events), calcTimelineDuration(events)))
    start_time = time.time()
    for i, event in enumerate(events):
        s.enter(
            event["elapsed"],
            1,
            send_single_event,
            argument=(event, url, start_time, i, len(events)),
        )
    s.run()
    print("Simulation stopped.")
    emit("simulationEnd", True)


# function for sending single event
def send_single_event(event, url, start_time, idx, num_of_events):
    try:
        r = requests.post(
            url,
            json=event["resource"],
            headers={"Authorization": "Bearer " + token},
            timeout=90,
        )
    except:
        has_error = True
        while has_error:
            print("An error occured, retrying...")
            r = requests.post(
                url,
                json=event["resource"],
                headers={"Authorization": "Bearer " + token},
                timeout=90,
            )
            has_error = False

    elapsed = time.time() - start_time
    print(f"{idx+1}/{num_of_events}", event["elapsed"], elapsed, r.status_code)
    emit(
        "postBundle",
        (idx + 1, event["resource"], event["timestamp"], elapsed, r.status_code),
    )

    if r.status_code == 404 or r.status_code == 400 or r.status_code == 412:
        print(r.json(), "\n\n")


def calcTimelineDuration(events):
    last_timestamp = datetime.fromisoformat(events[-1]["timestamp"])
    first_timestamp = datetime.fromisoformat(events[0]["timestamp"])
    return abs((last_timestamp - first_timestamp).total_seconds())


if __name__ == "__main__":
    socketio.run(app)
