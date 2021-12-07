from flask import Flask, jsonify, request, render_template
from flask_socketio import SocketIO
import json
import requests
import os
import time
import random

from dashapp.event.generator import Generator, Reader
from dashapp.event.tablebuilder import TableBuilder

#TODO
# fix bugs like 'Invalid match URL "<url>" - No resources match this search'
# transfer to webpage within 300s (pop from stack, sliding slider will reset range and continue popping from stack)
# build a textbox to type in values in seconds
# have many files (resources eg patient, medication)

events = []

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
@app.route('/index')
def dash():
    return render_template('index.html')

@app.route('/resource/<resource_type>')
def find_resource(resource_type=None):
    # request token
    reader = Reader()
    token = reader.request_token()

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

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/generate_events', methods=['POST'])
def generate_events():
    content = request.get_json()
    events.append(content)
    return ''

@app.route('/update_dash', methods=['GET'])
def update_dash():
    if len(events) == 0:
        payload = None
    else:
        payload = events.pop(0)
    return jsonify(resource=payload)

if __name__ == '__main__':
    socketio.run(app)
    