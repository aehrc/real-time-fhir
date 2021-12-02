import json
import requests

class Reader:
    def request_token(self):
        # read token from file and test validity
        with open('token.json', 'r') as infile:
            token = json.load(infile)['access_token']

        r = requests.get('***REMOVED***/fhir_r4/Patient', headers = {'Authorization': 'Bearer ' + token})

        # request new token if token expired
        if r.status_code == 401:
            data = {
                'grant_type': 'client_credentials',
                'scope': "system/*.write system/*.read",
                'client_id': "real-time-fhir",
            }
            r = requests.post('***REMOVED***/smartsec_r4/oauth/token', data=data)
            jwt = r.json()

            # write new token to file
            with open('token.json', 'w') as outfile:
                print('Authentication token renewed.')
                json.dump(jwt, outfile)
            
            token = jwt['access_token']
        return token
            

    def search_FHIR_data(self, url, token):
        r = requests.get(url, headers = {'Authorization': 'Bearer ' + token})
        print(r.json(), r.status_code)

if __name__ == '__main__':
    url = '***REMOVED***/fhir_r4/Patient'

    reader = Reader()
    token = reader.request_token()
    reader.search_FHIR_data(url, token)

