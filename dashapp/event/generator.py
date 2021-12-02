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
            s.enter(event['elapsed'], 1, send_event, argument=(url, event, start_time,))
        s.run()
        print('End time:', time.time())

    def read_EHR_data(self):
        with open('/home/yeexianfong/real-time-fhir/dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1',) as in_file:
            events = [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(json.loads(line)['effectiveDateTime']).timestamp()} for line in in_file]
            
        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)

# helper functionss
def normalize_elapsed(events, duration):
    range = events[-1]['elapsed'] - events[0]['elapsed']
    min = events[0]['elapsed']
    for event in events:
        event['elapsed'] = (event['elapsed']-min)/range * duration
    return events

def send_event(url, event, t):
    #r = requests.post(url, json=event['resource'])
    r = requests.post(url, json=event['resource'], headers={'Authorization': 'Bearer ***REMOVED***'})
    print(time.time()-t, r.status_code)

if __name__ == '__main__':
    url='***REMOVED***/fhir_r4/DiagnosticReport'
    #url='http://localhost:5000/generate_events'

    gen = Generator(100)
    #events = gen.read_EHR_data()
    gen.read_FHIR_client()
        
    #gen.send_events(events, url)
