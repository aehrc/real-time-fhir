import json
import os

# recursively find references within a resource json object
def find_reference(value, references, key=None):
    if type(value) == list:
        for item in value:
            references = find_reference(item, references)
    elif type(value) == dict:
        for k, v in value.items():
            references = find_reference(v, references, k)
    elif type(value) == str:
        if key == None:
            if value == 'reference':
                references.append(value)
        else:
            if key == 'reference':
                references.append(value)
    return references

# categorize reference ids into their respective resource types
def categorize_references(references):
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
    path = f'/home/yeexianfong/real-time-fhir/dashapp/input/{key}.ndjson'
    with open(path, 'r', encoding='latin-1',) as infile:
        resource_ids = {json.loads(line)['id']:i for i, line in enumerate(infile)}
        reference_idxs = {resource_ids[item] for item in reference_dict[key] if item in resource_ids}
    
    with open(path, 'r', encoding='latin-1',) as infile:
        return [json.loads(json_line) for i, json_line in enumerate(infile) if i in reference_idxs]

def get_references_json(reference_dict, key):
    if key == 'Organization' or key == 'Location':
        prefix = 'hospitalInformation'
    elif key == 'Practitioner' or key == 'PractitionerRole':
        prefix = 'practitionerInformation'

    dir_path = '/home/yeexianfong/real-time-fhir/dashapp/input/'
    files_with_prefix = [filename for filename in os.listdir(dir_path) if filename.startswith(prefix)]
    
    with open(dir_path + files_with_prefix[0], 'r', encoding='latin-1',) as infile:
        resources_pairs = {item['resource']['id']:item['resource'] for item in json.load(infile)['entry']
                        if item['resource']['resourceType'] == key}

    return [r_json for r_id, r_json in resources_pairs.items() if r_id in set(reference_dict[key])]


def build_entry(resource_json):
    entry = {
        'fullUrl': 'urn:uuid:' + resource_json['id'],
        'resource': resource_json,
        'request': {
            'method': 'PUT',
            'url': f'{resource_json["resourceType"]}/{resource_json["id"]}'
        }
    }
    return entry
    

def main():
    # find references recusively within a resource
    reference_list = []
    with open('/home/yeexianfong/real-time-fhir/dashapp/event/reference.json', 'r', encoding='latin-1') as infile:
        for key, val in json.load(infile).items():
            reference_list = find_reference(val, reference_list, key)

    # get categorized references in a dict
    ref_dict = categorize_references(reference_list)

    # get references from their respective local files
    references_json = []
    for k, v in ref_dict.items():
        if k == 'Organization':
            references_json.extend(get_references_json(ref_dict, k))
        else:
            references_json.extend(get_references_ndjson(ref_dict, k))

    # create FHIR bundle
    bundle = {
        'resourceType': 'Bundle',
        'type': 'transaction',
        'entry': []
    }
    bundle['entry'] = [build_entry(reference) for reference in references_json]

    # dump json bundle to local file
    with open('reference2.json', 'w', encoding='latin-1') as outfile:
        json.dump(bundle, outfile)
        print('Bundle dumped.')

     
# main function
if __name__ == '__main__':
    main()