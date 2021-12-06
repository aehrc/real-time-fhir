import json
from datetime import datetime, timedelta
from pytz import timezone
import threading
import sched, time
import requests

s = sched.scheduler(time.time)

# Generates and send events via POST to FHIR client
class Generator:
    def __init__(self, duration):
        self.duration = duration

    # generate normalized and sorted (elapsed, FHIR resource) key-value pairs 
    def generate_events(self):
        with open('/home/yeexianfong/real-time-fhir/dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1',) as infile:
            events = [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(json.loads(line)['effectiveDateTime']).timestamp()} for line in infile]
        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)

    # start timer and send events to FHIR client
    def send_events(self, events, url, token):
        start_time = time.time()
        for event in events:
            s.enter(event['elapsed'], 1, send_single_event, argument=(event, url, token, start_time,))
        s.run()

### helper functions for Generator class
# normalize events by defined duration e.g. 300s
def normalize_elapsed(events, duration):
    range = events[-1]['elapsed'] - events[0]['elapsed']
    min = events[0]['elapsed']
    for event in events:
        event['elapsed'] = (event['elapsed']-min)/range * duration
    return events

# function for sending single event 
def send_single_event(event, url, token, start_time):
    r = requests.post(url, json=event['resource'], headers={'Authorization': 'Bearer ' + token})
    print(time.time() - start_time, r.status_code)
    if r.status_code == 404:
        print(r.json(), '\n\n\n')
    #print(r.json(), '\n\n')


# Get access token and resources via GET from FHIR client
class Reader():
    # test old token validity and auto renews token
    def request_token(self):
        # read old token from file
        #with open('./dashapp/event/token.json', 'r') as infile:
        with open('/home/yeexianfong/real-time-fhir/dashapp/event/token.json', 'r') as infile:
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
            token = jwt['access_token']

            # write new token to file
            #with open('./dashapp/event/token.json', 'w') as outfile:
            with open('/home/yeexianfong/real-time-fhir/dashapp/event/token.json', 'w') as outfile:
                print('Authentication token renewed.')
                json.dump(jwt, outfile)

        return token
    
    # search and GET FHIR data based on url
    def search_FHIR_data(self, url, token):
        r = requests.get(url, headers = {'Authorization': 'Bearer ' + token})
        print(url, r.status_code)
        return r.json()

# main function
if __name__ == '__main__':
    #url='http://localhost:5000/generate_events'
    url='***REMOVED***/fhir_r4/DiagnosticReport'

    # Reader
    reader = Reader()
    token = reader.request_token()

    # Generator
    gen = Generator(300)
    #events = gen.generate_events()
        
    #gen.send_events(events, url, token)
