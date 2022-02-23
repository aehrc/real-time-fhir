#  Copyright © 2022, Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
#  Software Licence Agreement.

from datetime import datetime


class EventHelper:
    """
    A class of helper functions related to simulation events
    """

    def calc_timeline_duration(self, events):
        """
        Calculate timeline duration between earliest and latest timestamps in a simulation

        :param events: Dict containing bundles of events
        :return: Number of seconds between earliest and latest timestamps
        """
        last_timestamp = datetime.fromisoformat(events[-1]["timestamp"])
        first_timestamp = datetime.fromisoformat(events[0]["timestamp"])
        return abs((last_timestamp - first_timestamp).total_seconds())

    def get_upcoming_event(self, event):
        """
        Store resource id and expected time as an upcoming event dict

        :param event: Single resource bundle
        :return: Dict containing resource id and expected time
        """
        return {
            "id": event["resource"]["entry"][0]["resource"]["id"],
            "expectedTime": event["expectedTime"],
        }

    def get_upcoming_events(self, events):
        """
        Get the next 3 upcoming events from current event

        :param events: Dict containing bundles of events
        :return: List containing dicts of upcoming events
        """
        upcoming_events = events[:3] if len(events) >= 3 else events[: len(events)]

        return [self.get_upcoming_event(event) for event in upcoming_events]
