#  Copyright © 2022, Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
#  Software Licence Agreement.

from api.requester import Requester


class Reader:
    """
    A class for reading resources via GET from FHIR endpoint
    """

    def search_FHIR_data(self, url):
        """
        Search and request FHIR data from endpoint based on url

        :return: JSON payload of request
        """
        requester = Requester()
        r = requester.get_resource(url)
        return r.json()
