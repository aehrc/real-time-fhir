import json
import os

# Generates and send events via POST to FHIR client
class Referencer:
    def build_single_bundle(self, json_line):
        # find references recusively within a resource
        reference_list = []
        for key, val in json.loads(json_line).items():
            reference_list = search_reference_url(val, reference_list, key)
         
        # get categorized reference ids in a dict
        ref_id_dict = categorize_references_ids(reference_list)

        # get references from their respective local files
        references_json = []
        for k, v in ref_id_dict.items():
            if k == 'Organization' or k == 'Practitioner':
                references_json.extend(get_references_json(ref_id_dict, k))
            else:
                references_json.extend(get_references_ndjson(ref_id_dict, k))

        # create FHIR bundle
        #resources_json = [json.loads(json_line)].extend(references_json)
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
    path = f'/home/yeexianfong/real-time-fhir/dashapp/input/{key}.ndjson'
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

    dir_path = '/home/yeexianfong/real-time-fhir/dashapp/input/'
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
    
