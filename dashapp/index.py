import json
import logging
import os
import random
import sched
import time

import requests
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from dashapp.event.generator import Generator
from dashapp.event.reader import Reader
from dashapp.event.referencer import Referencer
from dashapp.event.tablebuilder import TableBuilder

s = sched.scheduler(time.time)

#TODO make patient deceased event
#TODO first thing start react js tutorial and learn how to build

events = []

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

reader = Reader()
token = reader.request_token()
gen = Generator(token)

@app.route('/')
@app.route('/index')
def dash():
    return render_template('index.html')

@app.route('/resource/<resource_type>')
def find_resource(resource_type=None):
    # define url and GET resource payload
    url=f'***REMOVED***/fhir_r4/{resource_type}'
    url_params = request.query_string.decode('ascii')
    if len(url_params) > 1:
        url += '?' + url_params
    payload = reader.search_FHIR_data(url, token)
    error_msg = ''

    # handle error by removing params from url and get payload again
    if payload['resourceType'] == 'OperationOutcome':
        if payload['issue'][0]['severity'] == 'error':
            error_msg = payload
            url=f'***REMOVED***/fhir_r4/{resource_type}'
            payload = reader.search_FHIR_data(url, token)
    
    # build resource table
    tb = TableBuilder(resource_type, payload)
    headers, data = tb.build_table()
    
    return render_template('resource.html', title=resource_type, url=url, headers=headers, data=data, error=error_msg)

@app.route('/simulator')
def dashboard():
    return render_template('simulator.html')

@socketio.on('start_simulation')
def start_simulation(data):
    print('Resource Type:', data['rtype'], '  Duration:', data['duration'])
    gen.set_duration_and_rtype(data['duration'], 'DiagnosticReport')
    events = gen.generate_events()
    send_events(events)

@socketio.on('stop_simulation')
def stop_simulation(data):
    list(map(s.cancel, s.queue))
    gen.reset_variables()
    print('Simulation stopped.')

# start timer and send events to FHIR client
def send_events(events):
    url = '***REMOVED***/fhir_r4/'
    emit('Sending Events', len(events))
    start_time = time.time()
    for i, event in enumerate(events):
        s.enter(event['elapsed'], 1, send_single_event, argument=(event, url, start_time, i, len(events)))
    s.run()
    emit('Simulation End', True)

# function for sending single event 
def send_single_event(event, url, start_time, idx, num_of_events):
    r = requests.post(url, json=event['resource'], headers={'Authorization': 'Bearer ' + token})
    elapsed = time.time() - start_time
    print(f'{idx+1}/{num_of_events}', event['elapsed'], elapsed, r.status_code)
    emit('Post Bundle', (event['resource'], elapsed, r.status_code))
    
    if r.status_code == 404 or r.status_code == 400 or r.status_code == 412:
        print(r.json(), '\n\n')
    
if __name__ == '__main__':
    socketio.run(app)
