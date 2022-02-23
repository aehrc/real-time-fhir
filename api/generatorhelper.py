#  Copyright © 2022, Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
#  Software Licence Agreement.

import json


class GeneratorHelper:
    """
    A class of helper functions related to event generation
    """

    @staticmethod
    def normalize_expected_time(events, duration):
        """
        Normalize events by a specified duration i.e. 300 seconds

        :return: Dict of events with normalized expected times
        """
        # Get range and minimum value
        range = events[-1]["expectedTime"] - events[0]["expectedTime"]
        if range == 0:
            range = 1

        min = events[0]["expectedTime"]

        # Normalize expect times
        for event in events:
            event["expectedTime"] = (event["expectedTime"] - min) / range * duration

        return events

    @staticmethod
    def load_json_timestamps(source_path, rtype):
        """
        Load timestamps of resources based on resource type

        :return: List of resource timestamps
        """
        with open(source_path, "r", encoding="latin-1") as infile:
            if rtype == "AllergyIntolerance" or rtype == "Condition":
                return [json.loads(line)["recordedDate"] for line in infile]

            if rtype == "CarePlan" or rtype == "CareTeam" or rtype == "Encounter":
                return [json.loads(line)["period"]["start"] for line in infile]

            if rtype == "Claim" or rtype == "ExplanationOfBenefit":
                return [json.loads(line)["created"] for line in infile]

            if (
                rtype == "DiagnosticReport"
                or rtype == "Observation"
                or rtype == "MedicationAdministration"
            ):
                return [json.loads(line)["effectiveDateTime"] for line in infile]

            if rtype == "DocumentReference":
                return [json.loads(line)["date"] for line in infile]

            if rtype == "ExplanationOfBenefit":
                return [json.loads(line)["created"] for line in infile]

            if rtype == "ImagingStudy":
                return [json.loads(line)["started"] for line in infile]

            if rtype == "Immunization" or rtype == "SupplyDelivery":
                return [json.loads(line)["occurrenceDateTime"] for line in infile]

            if rtype == "MedicationRequest":
                return [json.loads(line)["authoredOn"] for line in infile]

            if rtype == "Procedure":
                return [json.loads(line)["performedPeriod"]["start"] for line in infile]

            if rtype == "Provenance":
                return [json.loads(line)["recorded"] for line in infile]

        return None
