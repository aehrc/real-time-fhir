import json
import numpy as np

synthea_list = ['AllergyIntolerance', 'CarePlan', 'CareTeam', 'Claim', 'Condition', 'DiagnosticReport', 'DocumentReference',
                'Encounter', 'ExplanationOfBenefit', 'ImagingStudy', 'Immunization', 'MedicationAdministration',
                'MedicationRequest', 'Observation', 'Procedure', 'Provenance', 'SupplyDelivery']

class TableBuilder:
    def __init__(self, resource_type, payload):
        self.type = resource_type
        self.payload = payload
        self.headers = ['No.', 'ID']
        self.table = [['NULL', 'NULL']]
    
    # adds additional optional columns
    def build_table(self):
        '''
        numpy guide for appending columns
        appending two or more columns: self.table = np.append(self.table, cols, axis=1)
        appending two or more columns: self.table = np.c_[self.table, col]  
        '''
        if 'entry' in self.payload:
            # build table metadata
            self.table = np.asarray([[i+1, entry['resource']['id']] for i, entry in enumerate(self.payload['entry'])])
            last_updated_col = np.array([entry['resource']['meta']['lastUpdated'] for entry in self.payload['entry']])

            # build optional table content
            if self.type in synthea_list:
                self.headers.extend(['Timestamp'])

                if self.type == 'AllergyIntolerance' or self.type == 'Condition':
                    col = [entry['resource']['recordedDate'] for entry in self.payload['entry']]

                elif self.type == 'CarePlan' or self.type == 'CareTeam' or self.type == 'Encounter':
                    col = [entry['resource']['period']['start'] for entry in self.payload['entry']]

                elif self.type == 'Claim' or self.type == 'ExplanationOfBenefit':
                    col = [entry['resource']['created'] for entry in self.payload['entry']]
                
                elif self.type == 'DiagnosticReport' or self.type == 'Observation' or self.type == 'MedicationAdministration':
                    col = [entry['resource']['effectiveDateTime'] for entry in self.payload['entry']]

                elif self.type == 'DocumentReference':
                    col = [entry['resource']['date'] for entry in self.payload['entry']]
                
                elif self.type == 'ExplanationOfBenefit':
                    col = [entry['resource']['created'] for entry in self.payload['entry']]

                elif self.type == 'ImagingStudy':
                    col = [entry['resource']['started'] for entry in self.payload['entry']]
                
                elif self.type == 'Immunization' or self.type == 'SupplyDelivery':
                    col = [entry['resource']['occurrenceDateTime'] for entry in self.payload['entry']]
                
                elif self.type == 'MedicationRequest':
                    col = [entry['resource']['authoredOn'] for entry in self.payload['entry']]
                
                elif self.type == 'Provenance':
                    col = [entry['resource']['recorded'] for entry in self.payload['entry']]
                
                self.table = np.c_[self.table,  np.array(col)]

            # add last updated column to table
            self.headers.append('Entry Last Modified')
            self.table = np.c_[self.table, last_updated_col]
            
        return self.headers, self.table
