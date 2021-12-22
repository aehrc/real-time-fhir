import json
from datetime import datetime, timedelta
from pytz import timezone
import os

# Generates and send events via POST to FHIR client
class Generator:
    def __init__(self, token):
        self.duration = 0
        self.resource_type = None
        self.token = token
    
    def set_rtype_and_duration(self, resource_type, duration):
        self.resource_type = resource_type
        self.duration = duration
        
    def reset_variables(self):
        self.duration = 0
        self.resource_type = None
    
    # generate normalized and sorted (elapsed, FHIR resource) key-value pairs 
    def generate_events(self):
        # read resources and create event timestamps for each event
        src_path = f'./input/{self.resource_type}.ndjson'
        timestamps = load_json_timestamps(src_path, self.resource_type)
        with open(src_path, 'r', encoding='latin-1',) as infile:
            events = [{'resource': build_single_bundle(line), 
                        'elapsed': datetime.fromisoformat(timestamps[i]).timestamp()} 
                        for i, line in enumerate(infile)]
        return normalize_elapsed(sorted(events, key=lambda d: d['elapsed']), self.duration)
    
### helper functions for generating events
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

### helper functions for compiling resources with their references in a FHIR Bundle
def build_single_bundle(json_line):
    # find references recusively within a resource
    reference_list = []
    for key, val in json.loads(json_line).items():
        reference_list = search_reference_url(val, reference_list, key)
        
    # get categorized reference ids in a dict
    ref_id_dict = categorize_references_ids(reference_list)

    # get references from their respective local files
    references_json = []
    for k, v in ref_id_dict.items():
        if k == 'Organization' or k == 'Location' or k == 'Practitioner' or k == 'PractitionerRole' :
            references_json.extend(get_references_json(ref_id_dict, k))
        else:
            references_json.extend(get_references_ndjson(ref_id_dict, k))

    # create FHIR bundle
    references_json.insert(0, json.loads(json_line))
    bundle = {
        'resourceType': 'Bundle',
        'type': 'transaction',
        'entry': []
    }
    bundle['entry'] = [build_entry(reference) for reference in references_json]
    return bundle

def search_reference_url(value, references, key=None):
    '''
    find_reference recursively finds references within a resource json object/dict

    :param value: value in dictionary key-value pair, or item in list
    :param references: list storing a resource's references
    :param key: key in dictionary key-value pair, None if list
    :return: list storing a resource's reference urls
    '''
    if type(value) == list:
        for item in value:
            references = search_reference_url(item, references)
    elif type(value) == dict:
        for k, v in value.items():
            references = search_reference_url(v, references, k)
    elif type(value) == str:
        if key == None:
            if value == 'reference':
                references.append(value)
        else:
            if key == 'reference':
                references.append(value)
    return references

# categorize reference ids into their respective resource types
def categorize_references_ids(references):
    '''
    categorize_references categorizes reference ids into their respective resource types

    :param references: list storing a resource's references
    :return: dict storing (resource type, [resource ids]) as key-value pair
    '''
    # get resource types and reference ids
    rtypes = [item.split('?')[0] if '?' in item else item.split('/')[0] for item in references]
    reference_ids = [item.split('|')[1] if '?' in item else item.split('/')[1] for item in references]

    # build reference dict from above lists
    reference_dict = {}
    for i in range(len(rtypes)):
        if rtypes[i] in reference_dict:
            reference_dict[rtypes[i]].append(reference_ids[i])
        else:
            reference_dict[rtypes[i]] = [reference_ids[i]]
    return reference_dict

def get_references_ndjson(reference_dict, key):
    '''
    get_references_ndjson gets a resource's references from their respective local ndjson files

    :param reference_dict: dict storing (resource type, [resource ids]) as key-value pair
    :param key: str storing the resource type of a reference
    :return: list storing references in json strings
    '''
    # read all resource ids and get references' line numbers
    path = f'./input/{key}.ndjson'
    with open(path, 'r', encoding='latin-1',) as infile:
        resource_ids = {json.loads(line)['id']:i for i, line in enumerate(infile)}
        reference_idxs = {resource_ids[item] for item in reference_dict[key] if item in resource_ids}
    
    # use line numbers to check and store reference json strings 
    with open(path, 'r', encoding='latin-1',) as infile:
        return [json.loads(json_line) for i, json_line in enumerate(infile) if i in reference_idxs]

def get_references_json(reference_dict, key):
    '''
    get_references_json gets a resource's references from their respective local json files
    (Organization, Location, Practitioner and PractitionerRole)

    :param reference_dict: dict storing (resource type, [resource ids]) as key-value pair
    :param key: str storing the resource type of a reference
    :return: list storing references in dict type
    '''
    if key == 'Organization' or key == 'Location':
        prefix = 'hospitalInformation'
    elif key == 'Practitioner' or key == 'PractitionerRole':
        prefix = 'practitionerInformation'

    dir_path = './input/'
    files_with_prefix = [filename for filename in os.listdir(dir_path) if filename.startswith(prefix)]
    
    # read all resources and get reference ids (this can be done as json files are significantly smaller than ndjson)
    with open(dir_path + files_with_prefix[0], 'r', encoding='latin-1',) as infile:
        resources_pairs = {item['resource']['id']:item['resource'] for item in json.load(infile)['entry']
                        if item['resource']['resourceType'] == key}

    # use reference ids to check and store references dicts
    return [r_json for r_id, r_json in resources_pairs.items() if r_id in set(reference_dict[key])]


def build_entry(resource_json):
    '''
    build_entry builds a FHIR bundle entry with the attributes of reference dicts

    :param resource_json: json dict of reference
    :return: single bundle entry in dict format
    '''
    entry = {
        'fullUrl': 'urn:uuid:' + resource_json['id'],
        'resource': resource_json,
        'request': {
            'method': 'PUT',
            'url': f'{resource_json["resourceType"]}/{resource_json["id"]}'
        }
    }
    return entry
    
