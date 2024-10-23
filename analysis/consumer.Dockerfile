FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gnupg \
    curl \
    maven \
    && rm -rf /var/lib/apt/lists/*

RUN curl -s https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg

RUN echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" | tee /etc/apt/sources.list.d/zulu.list

RUN apt-get update && apt-get install -y zulu17-jre \
    && rm -rf /var/lib/apt/lists/*

COPY ./deps/pathling-7.1.0.dev0-py2.py3-none-any.whl /app/pathling-7.1.0.dev0-py2.py3-none-any.whl
RUN pip install --no-cache-dir /app/pathling-7.1.0.dev0-py2.py3-none-any.whl

COPY ./deps/library-runtime-7.1.0-SNAPSHOT.jar /app/library-runtime-7.1.0-SNAPSHOT.jar
RUN mvn install:install-file -Dfile=/app/library-runtime-7.1.0-SNAPSHOT.jar -DgroupId=au.csiro.pathling -DartifactId=library-runtime -Dversion=7.1.0-SNAPSHOT -Dpackaging=jar

COPY ./consumer_requirements.txt .
RUN pip install --no-cache-dir -r consumer_requirements.txt

# This caches the download of Spark and other dependencies.
RUN python -c 'from pyspark.sql import SparkSession; from pathling._version import (__java_version__, __scala_version__, __delta_version__, __hadoop_version__); from pyspark import __version__ as __spark_version__; SparkSession.builder.config("spark.jars.packages", f"org.apache.spark:spark-sql-kafka-0-10_{__scala_version__}:{__spark_version__}," f"au.csiro.pathling:library-runtime:{__java_version__}," f"io.delta:delta-spark_{__scala_version__}:{__delta_version__}," f"org.apache.hadoop:hadoop-aws:{__hadoop_version__}," f"org.postgresql:postgresql:42.2.18").getOrCreate()'

COPY streaming_views.py /app

CMD ["python", "/app/streaming_views.py"]
