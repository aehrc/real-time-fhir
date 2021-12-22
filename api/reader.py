import json
import requests

# Get access token and resources via GET from FHIR client
class Reader():
    # test old token validity and auto renews token
    def request_token(self):
        # read old token from file
        #with open('./dashapp/event/token.json', 'r') as infile:
        with open('./token.json', 'r') as infile:
            token = json.load(infile)['access_token']

        r = requests.get('***REMOVED***/fhir_r4/Patient', headers = {'Authorization': 'Bearer ' + token})

        # request new token if token expired
        if r.status_code == 401:
            data = {
                'grant_type': 'client_credentials',
                'scope': "system/*.read system/*.write",
                'client_id': "real-time-fhir",
            }
            r = requests.post('***REMOVED***/smartsec_r4/oauth/token', data=data)
            jwt = r.json()
            token = jwt['access_token']

            # write new token to file
            #with open('./dashapp/event/token.json', 'w') as outfile:
            with open('./token.json', 'w') as outfile:
                print('Authentication token renewed.')
                json.dump(jwt, outfile)
        return token
    
    # search and GET FHIR data based on url
    def search_FHIR_data(self, url, token):
        r = requests.get(url, headers = {'Authorization': 'Bearer ' + token})
        print(url, r.status_code)
        return r.json()