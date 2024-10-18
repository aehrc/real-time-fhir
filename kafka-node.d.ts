declare module 'kafka-node' {
  import { Writable } from 'stream';

  export class KafkaClient {
    constructor(options: { kafkaHost: string });
  }

  export class Producer {
    constructor(client: KafkaClient);
    on(event: string, callback: (...args: any[]) => void): this;
    send(payloads: any[], callback: (error: any, data: any) => void): void;
  }

  export class ProducerStream extends Writable {
    constructor(options: any);
  }
}
