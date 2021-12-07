import json
import numpy as np

class TableBuilder:
    def __init__(self, resource_type, payload):
        self.type = resource_type
        self.payload = payload
        self.headers = ['No.', 'ID', 'Full URL']
        self.table = [['NULL', 'NULL', 'NULL']]
    
    # adds additional optional columns
    ###
    # numpy guide for appending columns
    # appending two or more columns: self.table = np.append(self.table, cols, axis=1)
    # appending two or more columns: self.table = np.c_[self.table, col]  
    ###
    def build_table(self):
        if 'entry' in self.payload:
            # build table metadata
            self.headers = ['No.', 'ID', 'Full URL']
            self.table = np.asarray([[i+1, entry['resource']['id'], entry['fullUrl']] for i, entry in enumerate(self.payload['entry'])])
            last_updated_col = np.array([entry['resource']['meta']['lastUpdated'] for entry in self.payload['entry']])

            # build optional table content
            if self.type == 'DiagnosticReport' or self.type == 'Observation':
                self.headers.extend(['Timestamp'])
                col = np.array([entry['resource']['effectiveDateTime'] for entry in self.payload['entry']])
                self.table = np.c_[self.table, col]

            # add last updated column to table
            self.headers.append('Entry Last Modified')
            self.table = np.c_[self.table, last_updated_col]
            
        return self.headers, self.table
