#  Copyright © 2022, Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
#  Software Licence Agreement.

import json
import os


class Bundler:
    """
    A class for bundling resources and references to form FHIR bundle entries
    """

    def build_single_bundle(self, json_line):
        """
        Build a single bundle by compiling a resource and its references into a single bundle

        :param json_line: A single JSON line containing a resource entry from an NDJSON file
        :return: A bundle containing a resource and its references
        """
        # Find references recusively within a resource
        reference_list = []
        for key, val in json.loads(json_line).items():
            reference_list = self.search_reference_url(val, reference_list, key)

        # Get categorized reference ids in a dict
        ref_id_dict = self.categorize_references_ids(reference_list)

        # Get references from their respective local files
        references_json = []
        for k, v in ref_id_dict.items():
            if (
                k == "Organization"
                or k == "Location"
                or k == "Practitioner"
                or k == "PractitionerRole"
            ):
                references_json.extend(self.get_references_json(ref_id_dict, k))
            else:
                references_json.extend(self.get_references_ndjson(ref_id_dict, k))

        # Create FHIR bundle
        references_json.insert(0, json.loads(json_line))
        bundle = {"resourceType": "Bundle", "type": "transaction", "entry": []}
        bundle["entry"] = [self.build_entry(reference) for reference in references_json]
        return bundle

    def search_reference_url(self, value, references, key=None):
        """
        Find_reference recursively finds references within a resource json object/dict

        :param value: Value in dictionary key-value pair, or item in list
        :param references: List storing a resource's references
        :param key: Key in dictionary key-value pair, None if list
        :return: List storing a resource's reference urls
        """
        if type(value) == list:
            for item in value:
                references = self.search_reference_url(item, references)

        elif type(value) == dict:
            for k, v in value.items():
                references = self.search_reference_url(v, references, k)

        elif type(value) == str:
            if key == "reference":
                if not value.startswith("#"):
                    references.append(value)

        return references

    def categorize_references_ids(self, references):
        """
        Categorize_references categorizes reference ids into their respective resource types

        :param references: List storing a resource's references
        :return: Dict storing (resource type, [resource ids]) as key-value pair
        """
        # Get resource types and reference ids
        rtypes = [
            item.split("?")[0] if "?" in item else item.split("/")[0]
            for item in references
        ]
        reference_ids = [
            item.split("|")[1] if "?" in item else item.split("/")[1]
            for item in references
        ]

        # Build reference dict from above lists
        reference_dict = {}
        for i in range(len(rtypes)):
            if rtypes[i] in reference_dict:
                reference_dict[rtypes[i]].append(reference_ids[i])
            else:
                reference_dict[rtypes[i]] = [reference_ids[i]]

        return reference_dict

    def get_references_ndjson(self, reference_dict, key):
        """
        Get_references_ndjson gets a resource's references from their respective local ndjson files

        :param reference_dict: Dict storing (resource type, [resource ids]) as key-value pair
        :param key: Str storing the resource type of a reference
        :return: List storing references in json strings
        """
        # Read all resource ids and get references' line numbers
        path = f"./input/{key}.ndjson"
        with open(path, "r", encoding="latin-1") as infile:
            resource_ids = {json.loads(line)["id"]: i for i, line in enumerate(infile)}
            reference_idxs = {
                resource_ids[item]
                for item in reference_dict[key]
                if item in resource_ids
            }

        # Use line numbers to check and store reference json strings
        with open(path, "r", encoding="latin-1") as infile:
            return [
                json.loads(json_line)
                for i, json_line in enumerate(infile)
                if i in reference_idxs
            ]

    def get_references_json(self, reference_dict, key):
        """
        Get_references_json gets a resource's references from their respective local json files
        (Organization, Location, Practitioner and PractitionerRole)

        :param reference_dict: Dict storing (resource type, [resource ids]) as key-value pair
        :param key: Str storing the resource type of a reference
        :return: List storing references in dict type
        """
        if key == "Organization" or key == "Location":
            prefix = "hospitalInformation"
        elif key == "Practitioner" or key == "PractitionerRole":
            prefix = "practitionerInformation"

        dir_path = "./input/"
        files_with_prefix = [
            filename for filename in os.listdir(dir_path) if filename.startswith(prefix)
        ]

        # Read all resources and get reference ids (this can be done as json files are significantly smaller than ndjson)
        with open(dir_path + files_with_prefix[0], "r", encoding="latin-1") as infile:
            resources_pairs = {
                item["resource"]["id"]: item["resource"]
                for item in json.load(infile)["entry"]
                if item["resource"]["resourceType"] == key
            }

        # Use reference ids to check and store references dicts
        return [
            r_json
            for r_id, r_json in resources_pairs.items()
            if r_id in set(reference_dict[key])
        ]

    def build_entry(self, resource_json):
        """
        Build_entry builds a FHIR bundle entry with the attributes of reference dicts

        :param resource_json: JSON dict of reference
        :return: Single bundle entry in dict format
        """
        entry = {
            "fullUrl": "urn:uuid:" + resource_json["id"],
            "resource": resource_json,
            "request": {
                "method": "PUT",
                "url": f'{resource_json["resourceType"]}/{resource_json["id"]}',
            },
        }
        return entry
