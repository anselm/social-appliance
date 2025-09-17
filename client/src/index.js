import { ConsoleClient } from './console.js';

const client = new ConsoleClient();
client.run().catch(console.error);
