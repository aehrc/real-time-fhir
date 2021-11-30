from flask import Flask, jsonify, request, render_template
from flask_socketio import SocketIO
import json
import requests
import os
import time
import random

from dashapp.event.generator import Generator

# transfer to webpage within 300s (pop from stack, sliding will reset range and continue popping from stack)
# build a textbox to type in values in seconds
# slider to adjust
# have many files (resources eg patient, medication)

events = [
    { "timestamp":9999, "data":"default_data" }
]

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/dash')
def get_expenses():
    return jsonify(events)
    
@app.route('/dash', methods=['POST'])
def dash():
    content = request.get_json()
    events.append(content)
    return ''


'''
@app.route('/senddata', methods=['POST'])
def senddata():
    url = 'http://localhost:5000/dashboard'

    gen = Generator(30)
    events = gen.read_EHR_data()
    gen.send_events(events, url)

    return str(len(events))

@app.route('/_dynamic_get', methods = ['GET'])
def dynamic_get():
    result = resource_list.pop(0)
    return jsonify(dynamic_val=result)
'''
if __name__ == '__main__':
    socketio.run(app)
    