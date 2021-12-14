from flask import Flask, jsonify, request, render_template
import json
import os

from dashapp.event.generator import Generator
from dashapp.event.reader import Reader
from dashapp.event.tablebuilder import TableBuilder


# main function
if __name__ == '__main__':
    # request token first
    reader = Reader()
    token = reader.request_token()
    
    # generate events
    gen = Generator(token)
    gen.set_duration_and_rtype(120, 'DiagnosticReport')
    events = gen.generate_events()

    for event in events:
        print(event['elapsed'])

    '''
    bundler = Referencer()
    logfile = open('reference2.json', 'a', encoding='latin-1')
    with open('/home/yeexianfong/real-time-fhir/dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1') as infile:
        for i, line in enumerate(infile):
            if i == 5:
                break
            bundle = bundler.build_single_bundle(line)
            r = requests.post('***REMOVED***/fhir_r4/', json=bundle, headers={'Authorization': 'Bearer ' + token})
            print(r.status_code)
            json.dump(r.json(), logfile)
            logfile.write('\n\n')
    '''

''' NOT ESSENTIAL
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
    '''