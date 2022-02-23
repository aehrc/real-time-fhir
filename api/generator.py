#  Copyright © 2022, Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
#  Software Licence Agreement.

from datetime import datetime
from api.generatorhelper import GeneratorHelper
from api.bundler import Bundler


class Generator:
    """
    A class to perform processing of event generation
    """

    def __init__(self):
        self.duration = 0
        self.resource_type = None

    def set_rtype_and_duration(self, resource_type, duration):
        """
        Set resource type and duration class atrributes

        :param resource_type: resource type of simulation
        :param duration: specified duration for simulation
        """
        self.resource_type = resource_type
        self.duration = duration

    def reset_variables(self):
        """
        Reset resource type and duration attributes
        """
        self.resource_type = None
        self.duration = 0

    def generate_events(self):
        """
        Generate a dict of events normalized to duration and sorted chronologically from given NDJSON resource file

        :return: Dict of normalized and sorted events
        """
        bundler = Bundler()
        src_path = f"./input/{self.resource_type}.ndjson"

        # Read resources and create event timestamps for each event
        timestamps = GeneratorHelper.load_json_timestamps(src_path, self.resource_type)
        with open(src_path, "r", encoding="latin-1") as infile:
            # Resource holds the bundle
            # Timestamp holds the actual resource timestamp
            # ExpectedTime holds a formatted timestamp normalized to the specified duration
            events = [
                {
                    "resource": bundler.build_single_bundle(line),
                    "timestamp": timestamps[i],
                    "expectedTime": datetime.fromisoformat(timestamps[i]).timestamp(),
                }
                for i, line in enumerate(infile)
            ]

        # Normalize and sort according to expected times
        return GeneratorHelper.normalize_expected_time(
            sorted(events, key=lambda d: d["expectedTime"]), self.duration
        )
