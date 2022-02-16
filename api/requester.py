import os
import requests


class Requester:
    """
    A class for performing requests to endpoint for getting resource data, posting bundles and requesting authorization tokens
    """

    def __init__(self):
        self.token = self.request_token()

    def request_token(self):
        """
        Requests an access token with client credentials from environment variables

        :return: Valid authorization token str or None (if token environment variables are not configured)
        """
        token_url = os.environ.get("TOKEN_URL")
        client_id = os.environ.get("CLIENT_ID")
        client_secret = os.environ.get("CLIENT_SECRET")
        scope = os.environ.get("SCOPE")

        # if any of the environment variables are not set, no token is requested
        if None in [token_url, client_id, client_secret, scope]:
            return None

        # request access token
        data = {
            "grant_type": "client_credentials",
            "scope": scope,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        r = requests.post(token_url, data=data)
        jwt = r.json()
        token = jwt["access_token"]

        return token

    def get_resource(self, url):
        """
        Send a GET request to the endpoint to fetch resource data based on url

        :return: GET request object
        """
        if self.token == None:
            r = requests.get(url)

        else:
            r = requests.get(url, headers={"Authorization": "Bearer " + self.token})

            if str(r.status_code) == "401":
                r = requests.get(
                    url, headers={"Authorization": "Bearer " + self.request_token()}
                )

        return r

    def post_bundle(self, url, bundle):
        """
        Send a POST request to the endpoint to post a single bundle resource

        :return: POST request object
        """
        if self.token == None:
            r = requests.post(url, json=bundle, timeout=90)

        else:
            r = requests.post(
                url,
                json=bundle,
                headers={"Authorization": "Bearer " + self.token},
                timeout=90,
            )

            if str(r.status_code) == "401":
                r = requests.post(
                    url,
                    json=bundle,
                    headers={"Authorization": "Bearer " + self.request_token()},
                    timeout=90,
                )

        return r
