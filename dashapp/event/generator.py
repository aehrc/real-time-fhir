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
        with open('./dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1',) as in_file:
            events = generate_events(in_file)

        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)

# helper functions
def generate_events(infile):
        return [{'resource': json.loads(line), 'elapsed': datetime.fromisoformat(json.loads(line)['effectiveDateTime']).timestamp()} for line in infile]

def normalize_elapsed(events, duration):
    range = events[-1]['elapsed'] - events[0]['elapsed']
    min = events[0]['elapsed']
    for event in events:
        event['elapsed'] = (event['elapsed']-min)/range * duration
    return events

def send_event(url, event, t):
    r = requests.post(url, json=event['resource'], headers={'Authorization': 'Bearer eyJraWQiOiJzbWlsZWNkci1kZW1vIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJyZWFsLXRpbWUtZmhpciIsIm5iZiI6MTYzODMzNTExMSwiYXpwIjoicmVhbC10aW1lLWZoaXIiLCJzY29wZSI6InN5c3RlbVwvKi5yZWFkIiwiaXNzIjoiaHR0cHM6XC9cL2FlaHJjLWNkci5jY1wvc21hcnRzZWNfcjQiLCJzbWlsZV9jZHJfbW9kdWxlX2lkIjoic21hcnRfYXV0aF9leHRyYSIsInNtaWxlX2Nkcl9ub2RlX2lkIjoic21pbGVjZHJfcHJvY2VzcyIsImV4cCI6MTYzODMzODcxMSwidG9rZW5fdHlwZSI6IkJlYXJlciIsImlhdCI6MTYzODMzNTExMSwianRpIjoiMWI3ZWNhNjMtYzM2Yi00MzUyLTg4Y2YtZDk0Y2FlNGUwYWU0In0.HIkQCCLk85IsOXOdAyEKC467wkabJTT-hmxVy21dWN_cLOQv842PwsnI64IwGXddXEzrztpi2bn_B3KCZw4GmDcib7VaeSrZrvYPhLk1Xd3TBoJLmEBDRjhDfkZOzAsef4H1kUL2tAvc4juJjH0o0aQu-7HenqhCQ5WriMFEqPMtJQvSyTlMm1iTmeHN3yR6huFfoNaDnaXFe3J_fEVQGf6TFMp0hTt_lQ3J1jDrKMAiMXJ92rp4iWgbDhVl0fbtNdsQCTXI3lfCWQjEIpJkhYro6xpZGKBg7URq80cxDRamjfb9D-MmG42UazU6kE1x0LbpTZyqp6XdtGcSvjkYaQ'})
    print(time.time()-t, r.status_code)

if __name__ == '__main__':
    url='***REMOVED***/fhir_r4/DiagnosticReport'

    gen = Generator(300)
    events = gen.read_EHR_data()
    for i in events:
        print(i['elapsed'], i['resource']['id'])
        
    gen.send_events(events, url)
