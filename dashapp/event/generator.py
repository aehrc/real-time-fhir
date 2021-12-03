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


    def generate_events(self):
        with open('./dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1',) as infile:
            events = [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(json.loads(line)['effectiveDateTime']).timestamp()} for line in infile]
            
        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)


    def send_events(self, events, url, token):
        start_time = time.time()
        for event in events:
            s.enter(event['elapsed'], 1, send_event, argument=(event, url, token, start_time,))
        s.run()


    def request_token(self):
        # read token from file and test validity
        with open('token.json', 'r') as infile:
            token = json.load(infile)['access_token']

        r = requests.get('***REMOVED***/fhir_r4/Patient', headers = {'Authorization': 'Bearer ' + token})

        # request new token if token expired
        if r.status_code == 401:
            data = {
                'grant_type': 'client_credentials',
                'scope': "system/*.write system/*.read",
                'client_id': "real-time-fhir",
            }
            r = requests.post('***REMOVED***/smartsec_r4/oauth/token', data=data)
            jwt = r.json()

            # write new token to file
            with open('token.json', 'w') as outfile:
                print('Authentication token renewed.')
                json.dump(jwt, outfile)
            
            token = jwt['access_token']
        return token
            

    def search_FHIR_data(self, url, token):
        r = requests.get(url, headers = {'Authorization': 'Bearer ' + token})
        print(r.json(), r.status_code)

# helper functions
def normalize_elapsed(events, duration):
    range = events[-1]['elapsed'] - events[0]['elapsed']
    min = events[0]['elapsed']
    for event in events:
        event['elapsed'] = (event['elapsed']-min)/range * duration
    return events

def send_single_event(event, url, token, start_time):
    r = requests.post(url, json=event['resource'], headers={'Authorization': 'Bearer ' + token})
    print(time.time() - start_time, r.status_code)

if __name__ == '__main__':
    url='***REMOVED***/fhir_r4/Observation'
    #url='***REMOVED***/fhir_r4/DiagnosticReport'
    #url='http://localhost:5000/generate_events'

    gen = Generator(100)
    token = gen.request_token()
    gen.search_FHIR_data(url, token)
    #events = gen.read_EHR_data()
        
    #gen.send_events(events, url)
