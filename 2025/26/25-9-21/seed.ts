const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch categories
  const catRes = await fetch('https://opentdb.com/api_category.php');
  const categories = (await catRes.json()).trivia_categories;

  // Choose a category to sync (edit this value as needed)
  const chosenCategoryName = "General Knowledge"; // <-- Change this to your desired category
  const chosenCategory = categories.find(c => c.name === chosenCategoryName);
  if (!chosenCategory) {
    throw new Error(`Category '${chosenCategoryName}' not found.`);
  }

  // Insert only the chosen category
  await prisma.category.upsert({
    where: { opentdb_id: chosenCategory.id },
    update: {},
    create: {
      name: "Geography",
      opentdb_id: chosenCategory.id,
    },
  });

  // Difficulties and types from OpenTDB
  const difficulties = ['easy', 'medium', 'hard'];
  for (const level of difficulties) {
    await prisma.difficulty.upsert({
      where: { level },
      update: {},
      create: { level },
    });
  }
  const types = ['multiple', 'boolean'];
  for (const type of types) {
    await prisma.type.upsert({
      where: { type },
      update: {},
      create: { type },
    });
  }

  // Fetch questions for the chosen category
  const qRes = await fetch(`https://opentdb.com/api.php?amount=10&category=${chosenCategory.id}`);
  const questions = (await qRes.json()).results;

  for (const q of questions) {
    // Find difficulty, type
    const category = await prisma.category.findUnique({ where: { opentdb_id: chosenCategory.id } });
    const difficulty = await prisma.difficulty.findUnique({ where: { level: q.difficulty } });
    const type = await prisma.type.findUnique({ where: { type: q.type } });

    // Insert correct answer
    const correctAnswer = await prisma.answer.create({
      data: { answer: q.correct_answer },
    });

    // Insert incorrect answers
    const incorrectAnswers = [];
    for (const ia of q.incorrect_answers) {
      const ans = await prisma.answer.create({ data: { answer: ia } });
      incorrectAnswers.push(ans);
    }

    // Insert question
    await prisma.question.create({
      data: {
        question: q.question,
        categoryId: category?.id,
        difficultyId: difficulty?.id,
        typeId: type?.id,
        correct_answer_id: correctAnswer.id,
        incorrect_answers: {
          connect: incorrectAnswers.map(a => ({ id: a.id })),
        },
      },
    });
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());