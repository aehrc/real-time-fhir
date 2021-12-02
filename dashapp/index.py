from flask import Flask, jsonify, request, render_template
from flask_socketio import SocketIO
import json
import requests
import os
import time
import random

from dashapp.event.generator import Generator

#TODO
# transfer to webpage within 300s (pop from stack, sliding will reset range and continue popping from stack)
# build a textbox to type in values in seconds
# slider to adjust
# have many files (resources eg patient, medication)

events = []

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
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
        payload = {'resource': None}
    else:
        payload = events.pop(0)
    return jsonify(event=payload)

if __name__ == '__main__':
    socketio.run(app)
    