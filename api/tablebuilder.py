import numpy as np


synthea_list = ['AllergyIntolerance', 'CarePlan', 'CareTeam', 'Claim', 'Condition', 'DiagnosticReport', 'DocumentReference',
                'Encounter', 'ExplanationOfBenefit', 'ImagingStudy', 'Immunization', 'MedicationAdministration',
                'MedicationRequest', 'Observation', 'Procedure', 'Provenance', 'SupplyDelivery']

class TableBuilder:
    def __init__(self, resource_type, payload):
        self.type = resource_type
        self.payload = payload
        self.headers = ["No.", "Resource Type", "ID"]
        self.table = [["NULL", "NULL"]]

    # Adds additional optional columns
    def build_table(self):
        """
        Build resource table in resource page by building table metadata and content with numpy

        :return: Table headers, Table body
        """
        if "entry" in self.payload:
            # Build table metadata
            self.table = np.asarray(
                [
                    [i + 1, entry["resource"]["resourceType"], entry["resource"]["id"]]
                    for i, entry in enumerate(self.payload["entry"])
                ]
            )
            last_updated_col = np.array(
                [
                    entry["resource"]["meta"]["lastUpdated"]
                    for entry in self.payload["entry"]
                ]
            )

            # Build table resource content
            if self.type in synthea_list:
                self.headers.extend(["Timestamp"])

                if self.type == "AllergyIntolerance" or self.type == "Condition":
                    col = [
                        entry["resource"]["recordedDate"]
                        for entry in self.payload["entry"]
                    ]

                elif self.type == "CarePlan" or self.type == "CareTeam" or self.type == "Encounter":
                    col = [
                        entry["resource"]["period"]["start"]
                        for entry in self.payload["entry"]
                    ]

                elif self.type == "Claim" or self.type == "ExplanationOfBenefit":
                    col = [
                        entry["resource"]["created"] for entry in self.payload["entry"]
                    ]

                elif self.type == "DiagnosticReport" or self.type == "Observation" or self.type == "MedicationAdministration":
                    col = [
                        entry["resource"]["effectiveDateTime"]
                        for entry in self.payload["entry"]
                    ]

                elif self.type == "DocumentReference":
                    col = [entry["resource"]["date"] for entry in self.payload["entry"]]

                elif self.type == "ExplanationOfBenefit":
                    col = [
                        entry["resource"]["created"] for entry in self.payload["entry"]
                    ]

                elif self.type == "ImagingStudy":
                    col = [
                        entry["resource"]["started"] for entry in self.payload["entry"]
                    ]

                elif self.type == "Immunization" or self.type == "SupplyDelivery":
                    col = [
                        entry["resource"]["occurrenceDateTime"]
                        for entry in self.payload["entry"]
                    ]

                elif self.type == "MedicationRequest":
                    col = [
                        entry["resource"]["authoredOn"]
                        for entry in self.payload["entry"]
                    ]

                if self.type == "Procedure":
                    col = [
                        entry["resource"]["performedPeriod"]["start"]
                        for entry in self.payload["entry"]
                    ]

                elif self.type == "Provenance":
                    col = [
                        entry["resource"]["recorded"] for entry in self.payload["entry"]
                    ]

                self.table = np.c_[self.table, np.array(col)]

            # Add last updated column to table
            self.headers.append("Entry Last Modified")
            self.table = np.c_[self.table, last_updated_col]

        return self.headers, self.table
