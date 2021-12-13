import json
from datetime import datetime, timedelta
from pytz import timezone
import threading
import sched, time
import requests

s = sched.scheduler(time.time)

# Generates and send events via POST to FHIR client
class Generator:
    def __init__(self, token):
        self.duration = 0
        self.elapsed_offset = 0
        self.resource_type = None
        self.events = []
        self.token = token
        self.is_interrupted = False
        self.is_completed = False
    
    def set_duration_and_rtype(self, duration, resource_type):
        self.duration = duration
        self.resource_type = resource_type

    def get_duration(self):
        return self.duration
    
    def tweak_duration(self, duration_new):
        self.duration = duration_new
        self.is_interrupted = True
        list(map(s.cancel, s.queue))
        self.events = normalize_elapsed(self.events, duration_new-self.elapsed_offset)
        self.send_events()
    
    def get_is_completed(self):
        return self.is_completed

    def set_is_completed_false(self):
        self.is_completed = False
    
    def stop_events(self):
        list(map(s.cancel, s.queue))
        self.reset_variables()

    def reset_variables(self):
        self.duration = 0
        self.elapsed_offset = 0
        self.resource_type = None
        self.events = []
        self.is_interrupted = False
        self.is_completed = False

    # generate normalized and sorted (elapsed, FHIR resource) key-value pairs 
    def generate_events(self):
        src_path = f'/home/yeexianfong/real-time-fhir/dashapp/input/{self.resource_type}.ndjson'
        timestamp_list = load_json_timestamps(src_path, self.resource_type)
        with open(src_path, 'r', encoding='latin-1',) as infile:
            events = [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(timestamp_list[i]).timestamp()} for i, line in enumerate(infile)]
        self.events = normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)

    # start timer and send events to FHIR client
    def send_events(self):
        dst_url = f'***REMOVED***/fhir_r4/{self.resource_type}'
        start_time = time.time()
        offset = self.elapsed_offset
        for i, event in enumerate(self.events):
            put_url = dst_url + '/' + event['resource']['id']
            s.enter(event['elapsed'], 1, self.send_single_event, argument=(event, put_url, i, start_time, offset))
        s.run()

        if len(self.events) == 0:
            print('Simulation completed.\n')
            self.reset_variables()
            self.is_completed = True

    # function for sending single event 
    def send_single_event(self, event, put_url, idx, start_time, time_offset):
        r = requests.put(put_url, json=event['resource'], headers={'Authorization': 'Bearer ' + self.token})
        print(len(self.events), time.time() - start_time + time_offset, event['resource']['id'], r.status_code)
        self.elapsed_offset = time.time() - start_time
        if self.events:
            self.events.pop(0)
        
        if r.status_code == 404 or r.status_code == 400 or r.status_code == 412:
            print(r.json(), '\n\n')

    # add non-event resources to FHIR client
    def add_bundle(self):
        with open('/home/yeexianfong/real-time-fhir/dashapp/input/practitionerInformation1637908093743.json', 'r', encoding='latin-1',) as infile:
            json_data = json.load(infile)

        # data cleaning
        for entry in json_data['entry']:
            entry['request']['method'] = 'PUT'
            entry['request']['url'] += '/' + entry['resource']['id']
            if 'ifNoneExist' in entry['request']:
                del entry['request']['ifNoneExist']
        
        # post bundle
        r = requests.post('***REMOVED***/fhir_r4/', json=json_data, headers={'Authorization': 'Bearer ' + self.token})
        print(r.status_code)      
        print(r.json(), '\n')


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
