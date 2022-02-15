import json
import requests

class Reader:
    """
    A class for reading resources via GET from FHIR endpoint and validating tokens
    """
    def request_token(self):
        """
        Ensures the current aurthorization token is valid, requests new token if necessary

        :return: Valid authorization token in str
        """
        # Read old token from file
        with open("./token.json", "r") as infile:
            token = json.load(infile)["access_token"]

        r = requests.get(
            "***REMOVED***/fhir_r4/Patient",
            headers={"Authorization": "Bearer " + token},
        )

        # Request new token if token expired
        if r.status_code == 401:
            data = {
                "grant_type": "client_credentials",
                "scope": "system/*.read system/*.write",
                "client_id": "real-time-fhir",
            }
            r = requests.post("***REMOVED***/smartsec_r4/oauth/token", data=data)
            jwt = r.json()
            token = jwt["access_token"]

            # Write new token to file
            with open("./token.json", "w") as outfile:
                print("Authentication token renewed.")
                json.dump(jwt, outfile)

        return token

    # Search and GET FHIR data based on url
    def search_FHIR_data(self, url, token):
        r = requests.get(url, headers={"Authorization": "Bearer " + token})

        # Refresh token if auth error occurs
        if str(r.status_code) == "401":
            r = requests.get(
                url, headers={"Authorization": "Bearer " + self.request_token()}
            )

        return r.json()
