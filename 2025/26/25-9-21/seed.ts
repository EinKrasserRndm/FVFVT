// Use dynamic import for node-fetch inside the function
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OpenTDBCategory {
  id: number;
  name: string;
}

interface OpenTDBQuestion {
  category: string;
  category_id?: number;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTDBResponse {
  response_code: number;
  results: OpenTDBQuestion[];
}

interface OpenTDBTokenResponse {
  response_code: number;
  token?: string;
}

interface OpenTDBCategoriesResponse {
  trivia_categories: OpenTDBCategory[];
}

// Wrap everything in an async IIFE to avoid top-level await issues
(async () => {
  try {
    console.log("🚀 Starting seed process...");

    // Fetch categories
    console.log("Fetching categories...");
    const fetch = (await import('node-fetch')).default as typeof import('node-fetch').default;
    const catRes = await fetch('https://opentdb.com/api_category.php');
    const categoriesData = await catRes.json() as OpenTDBCategoriesResponse;
    const categories = categoriesData.trivia_categories;

    if (!categories || categories.length === 0) {
      throw new Error("No categories found from OpenTDB API.");
    }

    console.log(`✅ Fetched ${categories.length} categories.`);

    // Retrieve a session token
    console.log("Requesting session token...");
    const tokenRes = await fetch('https://opentdb.com/api_token.php?command=request');
    const tokenData = await tokenRes.json() as OpenTDBTokenResponse;
    const sessionToken = tokenData.token;

    if (!sessionToken) {
      throw new Error(`Failed to retrieve session token. Response: ${JSON.stringify(tokenData)}`);
    }

    console.log(`✅ Session token received: ${sessionToken}`);

    // Difficulties and types
    const difficulties = ['easy', 'medium', 'hard'] as const;
    for (const level of difficulties) {
      console.log(`⏳ Upserting difficulty: ${level}`);
      await prisma.difficulty.upsert({
        where: { level },
        update: {},
        create: { level },
      });
      console.log(`✅ Difficulty '${level}' upserted.`);
    }

    const types = ['multiple', 'boolean'] as const;
    for (const type of types) {
      console.log(`⏳ Upserting type: ${type}`);
      await prisma.type.upsert({
        where: { type },
        update: {},
        create: { type },
      });
      console.log(`✅ Type '${type}' upserted.`);
    }

    // Fetch all questions
    let allQuestionsFetched = false;
    let totalQuestions = 0;

    while (!allQuestionsFetched) {
      console.log(`⏳ Fetching next batch of 50 questions...`);
      const qRes = await fetch(`https://opentdb.com/api.php?amount=50&token=${sessionToken}`);
      const data = await qRes.json() as OpenTDBResponse;

      console.log(`API Response Code: ${data.response_code}`);

      if (data.response_code === 0) {
        const questions = data.results;
        console.log(`✅ Received ${questions.length} questions.`);

        for (const q of questions) {
          try {
            console.log(`\n--- Processing Question: ${q.question.substring(0, 50)}... ---`);
            console.log(`Category field: ${q.category}`);
            console.log(`Category ID field: ${q.category_id}`);

            // Find or create category using the category name (not ID) since OpenTDB might not return category_id
            let category = await prisma.category.findFirst({ 
              where: { name: q.category } 
            });

            if (!category) {
              console.log(`⏳ Creating category: ${q.category}`);
              category = await prisma.category.create({
                data: {
                  name: q.category,
                  opentdb_id: q.category_id ? parseInt(q.category_id.toString()) : null,
                },
              });
              console.log(`✅ Created category: ${category.name}`);
            }

            // Find difficulty, type
            const difficulty = await prisma.difficulty.findUnique({ where: { level: q.difficulty } });
            const type = await prisma.type.findUnique({ where: { type: q.type } });

            if (!difficulty || !type) {
              console.warn(`⚠️ Difficulty or type not found for question: ${q.question}`);
              continue;
            }

            // Insert correct answer
            const correctAnswer = await prisma.answer.create({
              data: { answer: q.correct_answer },
            });
            console.log(`✅ Correct answer created: ${correctAnswer.answer}`);

            // Insert incorrect answers
            const incorrectAnswers = [];
            for (const ia of q.incorrect_answers) {
              const ans = await prisma.answer.create({ data: { answer: ia } });
              incorrectAnswers.push(ans);
              console.log(`✅ Incorrect answer created: ${ans.answer}`);
            }

            // Insert question
            const question = await prisma.question.create({
              data: {
                question: q.question,
                categoryId: category.id,
                difficultyId: difficulty.id,
                typeId: type.id,
                correct_answer_id: correctAnswer.id,
                incorrect_answers: {
                  connect: incorrectAnswers.map(a => ({ id: a.id })),
                },
              },
            });

            console.log(`✅ Question saved: "${question.question.substring(0, 50)}..."`);
            totalQuestions++;
          } catch (err) {
            console.error(`❌ Error processing question: ${q.question.substring(0, 50)}...`, (err as Error).message);
          }
        }

      } else if (data.response_code === 4) {
        console.log('🎉 All available questions have been retrieved.');
        allQuestionsFetched = true;
      } else if (data.response_code === 5) {
        console.log("⚠️ Rate limited. Waiting 10 seconds before retrying...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        continue;
      } else {
        console.error(`❌ API Error: Response code ${data.response_code}. Data:`, data);
        allQuestionsFetched = true;
      }

      // Optional: Add delay to respect rate limits (1 request per 5 seconds)
      await new Promise(resolve => setTimeout(resolve, 15000));
    }

    console.log(`🎉 Total questions processed: ${totalQuestions}`);

  } catch (err) {
    console.error('🔥 Fatal error during seeding:', err);
    process.exit(1);
  } finally {
    console.log("🔌 Disconnecting from Prisma...");
    await prisma.$disconnect();
    console.log("✅ Database connection closed.");
  }
})();