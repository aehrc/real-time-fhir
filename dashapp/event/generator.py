import json
from datetime import datetime, timedelta
from pytz import timezone
import threading
import sched, time
import requests

s = sched.scheduler(time.time)

class Generator:
    def __init__(self, duration):
        self.duration = duration

    def send_events(self, events, url):
        start_time = time.time()
        print('Start time:', start_time)
        for event in events:
            s.enter(event['timestamp'], 1, send_event, argument=(url, event, start_time,))
        s.run()
        print('End time:', time.time())

    def read_EHR_data(self):
        with open('/home/yeexianfong/real-time-fhir/dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1',) as in_file:
            events = generate_events(in_file)

        return normalize_timestamps(sorted(events, key=lambda d: d['timestamp']), self.duration)

# helper functions
def generate_events(infile):
        return [{'resource': json.loads(line), 'timestamp': datetime.fromisoformat(json.loads(line)['effectiveDateTime']).timestamp()} for line in infile]

def normalize_timestamps(events, duration):
    range = events[-1]['timestamp'] - events[0]['timestamp']
    min = events[0]['timestamp']
    for event in events:
        event['timestamp'] = (event['timestamp']-min)/range * duration
    return events

def send_event(url, event, t):
    #event = {'timestamp': timestamp, 'resource': 'somevalues-successful'}
    #payload = {'key1': 'value1', 'key2': 'value2'}

    r = requests.post(url, json=event)
    print(time.time()-t, r.status_code)


if __name__ == '__main__':
    url='http://localhost:5000/dash'

    gen = Generator(30)
    events = gen.read_EHR_data()
    for i in events:
        print(i['timestamp'], i['resource']['id'])
        
    gen.send_events(events, url)