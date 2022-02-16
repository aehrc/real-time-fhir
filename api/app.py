import sched
import logging
import os
import time
import requests
from flask import Flask, request
from flask_socketio import SocketIO, emit

from api.generator import Generator
from api.reader import Reader
from api.tablebuilder import TableBuilder
from api.eventhelper import EventHelper
from api.requester import Requester

# Init scheduler
s = sched.scheduler(time.time)

# Init flask and socketio
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

# Init api classes
reader = Reader()
requester = Requester()
gen = Generator()
event_helper = EventHelper()


url_endpoint = os.environ.get("ENDPOINT_URL")
if url_endpoint == None:
    print("Endpoint not configured. Configure endpoint url as a environment variable before usage.")
    exit()
else:
    print("Endpoint configured as", url_endpoint)

### Resource page functions
@app.route("/resources/<resource_type>")
def find_resource(resource_type=None):
    """
    Parses a query from url and gets resource data from server

    :param resource_type: Resource type from url
    :return: Dict/JSON object storing table information
    """
    # Define url and GET resource payload
    url_get = f"***REMOVED***/fhir_r4/{resource_type}"
    url_params = request.query_string.decode("ascii")
    if len(url_params) > 1:
        url_get += "?" + url_params
    payload = reader.search_FHIR_data(url_get)

    # Return with error message if an error occured
    if payload["resourceType"] == "OperationOutcome":
        if payload["issue"][0]["severity"] == "error":
            return {
                "title": "",
                "url": url_get,
                "headers": [],
                "body": [],
                "error": payload["issue"][0]["diagnostics"],
            }

    # Build resource table
    tb = TableBuilder(resource_type, payload)
    headers, data = tb.build_table()
    data = data.tolist()
    return {
        "title": resource_type,
        "url": url_get,
        "headers": headers,
        "body": data,
        "error": "",
    }


### Simulator page functions
@socketio.on("start_simulation")
def start_simulation(data):
    """
    Starts the simulation by generating and sending events

    :param data: JSON object containing resource type and simulation duration from socketio emit
    """
    # Empty event queue if not already empty
    list(map(s.cancel, s.queue))

    gen.set_rtype_and_duration(data["rtype"], data["duration"])
    events = gen.generate_events()

    send_events(events)


@socketio.on("stop_simulation")
def stop_simulation():
    """
    Stops the current ongoing simulation
    """
    # Cancel all events in queue
    list(map(s.cancel, s.queue))

    gen.reset_variables()


@socketio.on("change_endpoint")
def change_endpoint(url):
    """
    Change the endpoint for bundle posting

    :param url: Endpoint url
    """
    global url_post_bundle
    url_post_bundle = url

    # Attempt a request to check if server is alive
    try:
        r = requests.get(url_post_bundle + "Patient?_count=1")
    except:
        emit("endpointStatus", {"url": url_post_bundle, "status": False})
        return

    emit("endpointStatus", {"url": url_post_bundle, "status": True})


def send_events(events):
    """
    Schedule and send events one-by-one

    :param events: Dict containing bundles of events
    """
    # Kick off simulation
    emit(
        "sendEvents",
        (
            len(events),
            event_helper.calc_timeline_duration(events),
            event_helper.get_upcoming_events(events),
        ),
    )

    start_time = time.time()

    # Schedule events
    for i, event in enumerate(events):
        # Get upcoming event with an offset of 3 from current event
        upcomingEvent = (
            event_helper.get_upcoming_event(events[i + 3])
            if i + 3 < len(events)
            else None
        )

        # Schedule single event
        s.enter(
            event["expectedTime"],
            1,
            send_single_event,
            argument=(event, url_post_bundle, start_time, i, upcomingEvent),
        )
    s.run()

    # End simulation
    emit("simulationEnd", True)


def send_single_event(event, url, start_time, idx, upcomingEvent):
    """
    Send a single event at a designated time

    :param event: Single event to be sent
    :param url: Endpoint url
    :param start_time: Scheduled time to send event
    :param idx: Index of event
    :param num_of_events: Total number of events
    :param upcomingEvent: Upcoming event offset by 3 from current event
    """
    start_elapsed = time.time() - start_time

    # Attempt to send bundle, keep retrying if an error occurs
    try:
        r = requester.post_bundle(url, event["resource"])
    except:
        has_error = True
        while has_error:
            print("An error occured, retrying...")
            r = requester.post_bundle(url, event["resource"])
            has_error = False

    completion_elapsed = time.time() - start_time

    emit(
        "postBundle",
        (
            idx + 1,
            event["resource"],
            event["timestamp"],
            event["expectedTime"],
            start_elapsed,
            completion_elapsed,
            upcomingEvent,
        ),
    )
