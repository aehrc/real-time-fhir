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
    def generate_events(self, resource_type):
        src_path = f'/home/yeexianfong/real-time-fhir/dashapp/input/{resource_type}.ndjson'
        timestamp_list = load_json_timestamps(src_path, resource_type)
        with open(src_path, 'r', encoding='latin-1',) as infile:
            events = [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(timestamp_list[i]).timestamp()} for i, line in enumerate(infile)]
        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)

    # start timer and send events to FHIR client
    def send_events(self, events, resource_type, token):
        dst_url = f'***REMOVED***/fhir_r4/{resource_type}'
        start_time = time.time()
        for event in events:
            put_url = dst_url + '/' + event['resource']['id']
            s.enter(event['elapsed'], 1, send_single_event, argument=(event, put_url, token, start_time,))
        s.run()
    
    # add non-event resources to FHIR client
    def add_bundle(self, token):
        with open('/home/yeexianfong/real-time-fhir/dashapp/input/practitionerInformation1637908093743.json', 'r', encoding='latin-1',) as infile:
            json_data = json.load(infile)

        # data cleaning
        for entry in json_data['entry']:
            entry['request']['method'] = 'PUT'
            entry['request']['url'] += '/' + entry['resource']['id']
            if 'ifNoneExist' in entry['request']:
                del entry['request']['ifNoneExist']

        # post bundle
        r = requests.post('***REMOVED***/fhir_r4/', json=json_data, headers={'Authorization': 'Bearer ' + token})
        print(r.status_code)      
        if r.status_code == 404 or r.status_code == 400:
            print(r.json(), '\n\n\n')  


### helper functions for Generator class
# normalize events by defined duration e.g. 300s
def normalize_elapsed(events, duration):
    range = events[-1]['elapsed'] - events[0]['elapsed']
    if range == 0: 
        range = 1
    min = events[0]['elapsed']

    for event in events:
        event['elapsed'] = (event['elapsed']-min)/range * duration
    return events

# function for sending single event 
def send_single_event(event, put_url, token, start_time):
    r = requests.put(put_url, json=event['resource'], headers={'Authorization': 'Bearer ' + token})
    print(time.time() - start_time, event['resource']['id'], r.status_code)
    if r.status_code == 404 or r.status_code == 400 or r.status_code == 412:
        print(r.json(), '\n\n')
        
def load_json_timestamps(source_path, rtype):
    with open(source_path, 'r', encoding='latin-1',) as infile:
        if rtype == 'AllergyIntolerance' or rtype == 'Condition':
            return [json.loads(line)['recordedDate'] for line in infile]

        if rtype == 'CarePlan' or rtype == 'CareTeam' or rtype == 'Encounter':
            return [json.loads(line)['period']['start'] for line in infile]

        if rtype == 'Claim' or rtype == 'ExplanationOfBenefit':
            return [json.loads(line)['created'] for line in infile]

        if rtype == 'DiagnosticReport' or rtype == 'Observation' or rtype == 'MedicationAdministration':
            return [json.loads(line)['effectiveDateTime'] for line in infile]
        
        if rtype == 'DocumentReference':
            return [json.loads(line)['date'] for line in infile]
        
        if rtype == 'ExplanationOfBenefit':
            return [json.loads(line)['created'] for line in infile]

        if rtype == 'ImagingStudy':
            return [json.loads(line)['started'] for line in infile]
        
        if rtype == 'Immunization' or rtype == 'SupplyDelivery':
            return [json.loads(line)['occurrenceDateTime'] for line in infile]
        
        if rtype == 'MedicationRequest':
            return [json.loads(line)['authoredOn'] for line in infile]
        
        if rtype == 'Procedure':
            return [json.loads(line)['performedPeriod']['start'] for line in infile]

        if rtype == 'Provenance':
            return [json.loads(line)['recorded'] for line in infile]
    return None
        

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
                'scope': "system/*.read system/*.write",
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
    
    '''
    def delete_FHIR_data(self, url, token):
        r = requests.delete(url, headers = {'Authorization': 'Bearer ' + token})
        print(url, r.status_code)
        print(r.json())
    '''

# main function
if __name__ == '__main__':
    resource_type_to_send = 'Provenance'

    # request token first
    reader = Reader()
    token = reader.request_token()

    # generate events
    gen = Generator(30)
    events = gen.generate_events(resource_type_to_send)
    gen.send_events(events, resource_type_to_send, token)

    # for adding non-events and bundles
    # gen.add_bundle(token)