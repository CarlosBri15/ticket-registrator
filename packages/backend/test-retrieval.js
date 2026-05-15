const { GoogleGenerativeAI, TaskType } = require('@google/generative-ai');
const postgres = require('postgres');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL || 'postgres://root:examplePassword@localhost:5432/ticket_registrator');

// The question we want to ask the database
const QUESTION = "Does the company pay beers?";

async function testRetrieval() {
  try {
    console.log(`\n🤔 Question: "${QUESTION}"\n`);
    
    // 1. Embed the Question
    // For SEARCHING the database, we explicitly use RETRIEVAL_QUERY!
    // (We only use RETRIEVAL_DOCUMENT when inserting chunks).
    console.log("1. Embedding the question...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    
    const result = await model.embedContent({
      content: { parts: [{ text: QUESTION }] },
      taskType: TaskType.RETRIEVAL_QUERY, // <-- Must be QUERY!
      outputDimensionality: 768,
    });
    
    const embeddingVector = result.embedding.values;
    console.log(`   ✅ Question embedded! (Dimension: ${embeddingVector.length})\n`);

    // 2. Search the database using pgvector's cosine distance (<=>)
    console.log("2. Searching the database for the 3 most relevant chunks...");
    
    // We convert the array to the string literal format pgvector expects: "[0.1, 0.2...]"
    const vectorString = JSON.stringify(embeddingVector);

    const rows = await sql`
      SELECT 
        id, 
        content, 
        1 - (embedding <=> ${vectorString}::vector) AS similarity 
      FROM policy_chunks 
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT 3
    `;

    if (rows.length === 0) {
      console.log("   ❌ No chunks found in the database. Did you run the ingestion?");
      return;
    }

    console.log("   ✅ Found relevant chunks!\n");
    console.log("==================================================\n");

    // 3. Print the results
    rows.forEach((row, i) => {
      console.log(`🏆 RANK ${i + 1} (Similarity Score: ${(row.similarity * 100).toFixed(2)}%)`);
      console.log(`--------------------------------------------------`);
      console.log(row.content.trim());
      console.log(`\n==================================================\n`);
    });

  } catch (error) {
    console.error("Retrieval failed:", error);
  } finally {
    await sql.end();
  }
}

testRetrieval();
