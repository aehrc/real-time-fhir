import json
import requests

from dashapp.event.generator import Generator
from dashapp.event.reader import Reader
from dashapp.event.tablebuilder import TableBuilder
from dashapp.event.referencer import Referencer


# main function
if __name__ == '__main__':
    # request token first
    reader = Reader()
    token = reader.request_token()
    #print(5)

    
    # for adding non-events and bundles
    #gen.add_bundle()
    bundler = Referencer()
    logfile = open('reference2.json', 'a', encoding='latin-1')
    with open('/home/yeexianfong/real-time-fhir/dashapp/input/DiagnosticReport.ndjson', 'r', encoding='latin-1') as infile:
        for i, line in enumerate(infile):
            if i == 5:
                break
            bundle = bundler.get_single_bundle(line)
            r = requests.post('***REMOVED***/fhir_r4/', json=bundle, headers={'Authorization': 'Bearer ' + token})
            print(r.status_code)
            json.dump(r.json(), logfile)
            logfile.write('\n\n')

    
    