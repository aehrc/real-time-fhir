from flask import Flask, jsonify, request, render_template
from flask_socketio import SocketIO
import json
import requests
import os
import time
import random

from dashapp.event.generator import Generator, Reader

#TODO
# transfer to webpage within 300s (pop from stack, sliding will reset range and continue popping from stack)
# build a textbox to type in values in seconds
# slider to adjust
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
    url=f'***REMOVED***/fhir_r4/{resource_type}'
    
    reader = Reader()
    token = reader.request_token()
    payload = reader.search_FHIR_data(url, token)

    headers = ('ID', 'Full URL')
    data = [(entry['resource']['id'], entry['fullUrl']) for entry in payload['entry']]
        
    return render_template('resource.html', title=resource_type, headers=headers, data=data)

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
    