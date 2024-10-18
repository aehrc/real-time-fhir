import express, { Request, Response } from "express";
import { Kafka } from "kafkajs";

const app = express();
const kafkaTopic = "fhir_events";

const clientId = process.env.KAFKA_CLIENT_ID || "fhir-adapter";
const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

const kafka = new Kafka({
  clientId: clientId,
  brokers: brokers,
});

const producer = kafka.producer();

app.post(
  "/fhir",
  express.raw({ type: "application/fhir+json", limit: "50mb" }),
  async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body.toString());

      if (body.resourceType !== "Bundle") {
        res.status(400).send("Invalid resourceType. Expected 'Bundle'.");
        return;
      }

      await producer.connect();
      await producer.send({
        topic: kafkaTopic,
        messages: [{ value: JSON.stringify(body) }],
      });

      console.log("Message sent to Kafka topic:", kafkaTopic);
      res.status(200).send("Message sent to Kafka");
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Error processing request");
    } finally {
      await producer.disconnect();
    }
  }
);

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Kafka FHIR adapter is running on port ${process.env.PORT || 3000}`
  );
  console.log(`Kafka client ID: ${clientId}`);
  console.log(`Kafka brokers: ${brokers}`);
  console.log("foo");
});
