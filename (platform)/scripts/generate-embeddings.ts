// Generate embeddings for training examples
import { prisma } from '../lib/database/prisma';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const openaiKey = process.env.OPENAI_API_KEY!;

if (!openaiKey) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiKey });

async function generateEmbeddings() {
  console.log('🤖 Generating Embeddings for Training Examples\n');

  // Fetch all examples without embeddings using raw SQL
  const examples: any[] = await prisma.$queryRaw`
    SELECT id, user_input, assistant_response
    FROM example_conversations
    WHERE embedding IS NULL
  `;

  if (!examples || examples.length === 0) {
    console.log('✅ All examples already have embeddings!');
    await prisma.$disconnect();
    return;
  }

  console.log(`📝 Found ${examples.length} examples needing embeddings\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const example of examples) {
    try {
      // Combine user input and assistant response for embedding
      const textToEmbed = `User: ${example.user_input}\nAssistant: ${example.assistant_response}`;

      console.log(`Processing: "${example.user_input.substring(0, 50)}..."`);

      // Generate embedding using OpenAI
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: textToEmbed,
      });

      const embedding = response.data[0].embedding;

      // Convert embedding array to pgvector format
      const embeddingStr = `[${embedding.join(',')}]`;

      // Update example with embedding using raw SQL (cast ID to uuid)
      await prisma.$executeRaw`
        UPDATE example_conversations
        SET embedding = ${embeddingStr}::vector
        WHERE id = ${example.id}::uuid
      `;

      console.log(`  ✅ Embedding generated (${embedding.length} dimensions)`);
      successCount++;

      // Rate limit: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err: any) {
      console.error(`  ❌ Error:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);

  if (successCount > 0) {
    console.log(`\n🎉 Embeddings generated successfully!`);
    console.log(`   Vector search is now fully functional.`);
  }

  await prisma.$disconnect();
}

generateEmbeddings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
