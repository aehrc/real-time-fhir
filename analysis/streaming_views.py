#!/usr/bin/env python3
import click
import os
from pathling._version import (
    __java_version__,
    __scala_version__,
    __delta_version__,
    __hadoop_version__,
)

from pyspark import __version__ as __spark_version__
from pyspark.sql import SparkSession
from pathling import PathlingContext
from pyspark.sql.functions import col, get_json_object, explode, schema_of_json, from_json, to_json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TARGET_DIR = os.path.join(BASE_DIR, 'target')
SPARK_WAREHOUSE_DIR = os.path.join(TARGET_DIR, 'spark-warehouse')
SPARK_CHECKPOINT_DIR = os.path.join(TARGET_DIR, 'checkpoints')


def _get_or_create_spark():
    os.environ['SPARK_CONF_DIR'] = os.path.join(BASE_DIR, 'conf', 'spark-conf')
    spark_builder = (
        SparkSession.builder.config(
            "spark.jars.packages",
            f"org.apache.spark:spark-sql-kafka-0-10_{__scala_version__}:{__spark_version__},"
            f"au.csiro.pathling:library-runtime:{__java_version__},"
            f"io.delta:delta-spark_{__scala_version__}:{__delta_version__},"
            f"org.apache.hadoop:hadoop-aws:{__hadoop_version__}",
        )
        .config("spark.sql.warehouse.dir", SPARK_WAREHOUSE_DIR) \
        .config("spark.driver.extraJavaOptions", f"-Dderby.system.home={TARGET_DIR}")
        .enableHiveSupport() \
        .config(
            "spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension"
        )
        .config(
            "spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog",
        )
        .config(
            "spark.sql.streaming.checkpointLocation",
            SPARK_CHECKPOINT_DIR
        )
    )
    return spark_builder.getOrCreate()


def view_patients(data):
    return data.view(
        "Patient",
        select=[
            {
                "column": [
                    {
                        "description": "Patient ID",
                        "path": "getResourceKey()",
                        "name": "id",
                    },
                    {
                        "description": "Birth date",
                        "path": "birthDate",
                        "name": "birth_date",
                    },
                    {
                        "description": "Postal code",
                        "path": "address.postalCode",
                        "name": "postal_code",
                        "collection": True
                    },
                    {
                        "description": "Deceased time",
                        "path": "deceased.ofType(dateTime)",
                        "name": "deceased",
                    },
                ]
            },
        ],
    )


#
# Prostate cancer diagnosis view
#
def view_diagnosis(data):
    return data.view(
        "Condition",
        select=[
            {
                "column": [
                    {
                        "description": "Condition ID",
                        "path": "getResourceKey()",
                        "name": "id",
                    },
                    {
                        "description": "Patient ID",
                        "path": "subject.getReferenceKey()",
                        "name": "patient_id",
                    },
                    {
                        "description": "SNOMED CT diagnosis code",
                        "path": "code.coding.where(system = 'http://snomed.info/sct').code",
                        "name": "sct_id",
                    },
                    {
                        "description": "Date of onset",
                        "path": "onsetDateTime",
                        "name": "onset",
                    },
                ]
            }
        ],
        where=[
            {
                "description": "Neoplasm of prostate",
                "path": "code.coding.exists(system = 'http://snomed.info/sct'"
                        "and code = '126906006')",
            }
        ],
    )


#
# Hyperlipidemia view
#
def view_cholesterol(data):
    return data.view(
        "Observation",
        select=[
            {
                "column": [
                    {
                        "description": "Observation ID",
                        "path": "getResourceKey()",
                        "name": "id",
                    },
                    {
                        "description": "Patient ID",
                        "path": "subject.getReferenceKey()",
                        "name": "patient_id",
                    },
                    {
                        "description": "Observation date",
                        "path": "effective.ofType(dateTime)",
                        "name": "date",
                    },
                ],
                "select": [
                    {
                        "forEach": "code.coding",
                        "column": [
                            {
                                "description": "Observation code",
                                "path": "code",
                                "name": "code",
                            },
                        ],
                    },
                    {
                        "forEach": "value.ofType(Quantity)",
                        "column": [
                            {
                                "description": "Total cholesterol unit",
                                "path": "unit",
                                "name": "unit",
                            },
                            {
                                "description": "Total cholesterol value",
                                "path": "value",
                                "name": "value",
                            },
                        ],
                    },
                ],
            }
        ],
        where=[
            {
                "description": "Total cholesterol > 240 mg/dL",
                "path": "where(code.coding.exists(system = 'http://loinc.org'"
                        "and code = '2093-3'))"
                        ".value.ofType(Quantity) > 240 'mg/dL'",
            }
        ],
    )


#
# BMI view
#
def view_bmi(data):
    return data.view(
        "Observation",
        select=[
            {
                "column": [
                    {
                        "description": "Observation ID",
                        "path": "getResourceKey()",
                        "name": "id",
                    },
                    {
                        "description": "Patient ID",
                        "path": "subject.getReferenceKey()",
                        "name": "patient_id",
                    },
                    {
                        "description": "Observation date",
                        "path": "effective.ofType(dateTime)",
                        "name": "date",
                    },
                ],
                "select": [
                    {
                        "forEach": "code.coding",
                        "column": [
                            {
                                "description": "Observation code",
                                "path": "code",
                                "name": "code",
                            },
                        ],
                    },
                    {
                        "forEach": "value.ofType(Quantity)",
                        "column": [
                            {
                                "description": "BMI unit",
                                "path": "unit",
                                "name": "unit",
                            },
                            {
                                "description": "BMI value",
                                "path": "value",
                                "name": "value",
                            },
                        ],
                    },
                ],
            }
        ],
        where=[
            {
                "description": "BMI > 30 kg/m2",
                "path": "where(code.coding.exists(system = 'http://loinc.org'"
                        "and code = '39156-5'))"
                        ".value.ofType(Quantity) > 30 'kg/m2'",
            }
        ],
    )


@click.command()
@click.option('--kafka-topic', default="fhir_events", help="Kafka topic to subscribe to")
@click.option('--kafka-bootstrap-servers', default="kafka:9092", help="Kafka bootstrap servers")
@click.option('--db-name', default="ckd_views", help="Database name to write to")
def start_consumer(kafka_topic, kafka_bootstrap_servers, db_name):

    def _subscribe_to_kafka_topic():
        return spark \
            .readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", kafka_bootstrap_servers) \
            .option("subscribe", kafka_topic) \
            .option("startingOffsets", "earliest") \
            .load()

    def _to_resource_stream(kafka_stream, resource_type):
        json_stream = kafka_stream \
            .selectExpr("CAST(value AS STRING) AS bundle") \
            .select(explode(from_json("bundle", 'STRUCT<entry:ARRAY<STRUCT<resource:STRING>>>').entry.resource).alias(
            "resource")) \
            .filter(from_json("resource", 'STRUCT<resourceType:STRING>').resourceType == resource_type)
        return pc.encode(json_stream, resource_type)

    click.echo(f"Starting kafka listener on topic: {kafka_topic} at: {kafka_bootstrap_servers}")
    click.echo(f"Writing to database: {db_name}")

    spark = _get_or_create_spark()
    pc = PathlingContext.create(spark)

    spark.sql(f"CREATE SCHEMA IF NOT EXISTS {db_name}")
    spark.catalog.setCurrentDatabase(db_name)

    update_stream = _subscribe_to_kafka_topic()

    data = pc.read.datasets({
        resource_type: _to_resource_stream(update_stream, resource_type)
        for resource_type in ["Patient", "Observation", "Condition"]
    })

    all_views = [view_patients, view_cholesterol, view_bmi, view_diagnosis]

    console_sinks = [view_f(data) \
                         .writeStream \
                         .outputMode("append") \
                         .format("console") \
                         .start(f"console_{view_f.__name__}") for view_f in all_views]

    parquet_sinks = [view_f(data) \
                         .writeStream \
                         .outputMode("append") \
                         .format("parquet") \
                         .queryName(f"table_{view_f.__name__}") \
                         .toTable(view_f.__name__) for view_f in all_views]

    for sink in console_sinks + parquet_sinks:
        sink.awaitTermination()


if __name__ == '__main__':
    start_consumer()
