import '../src/env.js';

async function run(): Promise<void> {
  const { ingestDocuments } = await import('../src/agent/ingestion.js');

  await ingestDocuments();
  process.exit(0);
}

run().catch((error: unknown) => {
  console.error('ERROR: ', error);
  process.exit(1);
});
