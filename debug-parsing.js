// Debug script to test markdown parsing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the example markdown content
const markdownContent = fs.readFileSync(path.join(__dirname, 'docs/mds/example-quiz-format.md'), 'utf8');

console.log('=== MARKDOWN CONTENT ===');
console.log(markdownContent);
console.log('\n=== PARSING TEST ===');

// Simple parsing simulation (based on markdown-quiz-parser.ts logic)
function debugParseMarkdownQuiz(markdownContent) {
  const lines = markdownContent.split('\n');

  const quiz = {
    title: '',
    description: '',
    questions: [],
    settings: {}
  };

  let currentQuestion = null;
  let questionIndex = 0;

  console.log(`Processing ${lines.length} lines...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    console.log(`Line ${i + 1}: "${line}"`);

    // Parse title (first H1)
    if (line.startsWith('# ') && !quiz.title) {
      quiz.title = line.substring(2).trim();
      console.log(`  -> Found title: "${quiz.title}"`);
      continue;
    }

    // Parse question headers (## Q1, ## Q2, ## Question, etc.)
    if (line.match(/^## (Q\d+|Question)/)) {
      console.log(`  -> Found question header: "${line}"`);

      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        console.log(`  -> Saving previous question: ${JSON.stringify(currentQuestion, null, 2)}`);
        quiz.questions.push(currentQuestion);
      }

      // Start new question
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice',
        question_content: {},
        options: {},
        answer_data: {},
        order_index: questionIndex++
      };
      console.log(`  -> Started new question ${questionIndex}`);
      continue;
    }

    // Parse question text
    if (currentQuestion && !currentQuestion.question_text && line && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('#')) {
      currentQuestion.question_text = line;
      console.log(`  -> Found question text: "${line}"`);
      continue;
    }

    // Parse multiple choice options
    if (currentQuestion && line.match(/^- \[(x| )\]/)) {
      const isCorrect = line.includes('[x]');
      const optionText = line.replace(/^- \[(x| )\]/, '').trim();
      console.log(`  -> Found MCQ option: "${optionText}" (correct: ${isCorrect})`);

      // Initialize options if needed
      if (!currentQuestion.options) currentQuestion.options = {};
      if (!currentQuestion.answer_data) currentQuestion.answer_data = {};

      const options = currentQuestion.options;
      const answerData = currentQuestion.answer_data;

      if (!options.choices) {
        options.choices = [];
      }

      const optionIndex = options.choices.length;
      options.choices.push(optionText);

      if (isCorrect) {
        currentQuestion.options.correct_index = optionIndex;
        answerData.correct_answer = optionText;
        console.log(`    -> Set as correct answer`);
      }

      currentQuestion.question_type = 'multiple_choice';
      continue;
    }

    // Parse true/false questions
    if (currentQuestion && line.match(/^(True|False):/)) {
      const isTrue = line.startsWith('True:');
      const explanation = line.substring(line.indexOf(':') + 1).trim();
      console.log(`  -> Found T/F: ${isTrue}, explanation: "${explanation}"`);

      currentQuestion.question_type = 'true_false';
      currentQuestion.options = {};
      currentQuestion.answer_data = {
        correct_answer: isTrue,
        explanation: explanation
      };
      continue;
    }

    // Parse text input questions
    if (currentQuestion && line.startsWith('Answer:')) {
      const answer = line.substring(7).trim();
      console.log(`  -> Found text answer: "${answer}"`);

      currentQuestion.question_type = 'text_input';
      currentQuestion.options = {};
      currentQuestion.answer_data = {
        correct_answer: answer
      };
      continue;
    }
  }

  // Save last question
  if (currentQuestion && currentQuestion.question_text) {
    console.log(`  -> Saving final question: ${JSON.stringify(currentQuestion, null, 2)}`);
    quiz.questions.push(currentQuestion);
  }

  return quiz;
}

const parsedQuiz = debugParseMarkdownQuiz(markdownContent);

console.log('\n=== FINAL PARSED QUIZ ===');
console.log(JSON.stringify(parsedQuiz, null, 2));

console.log('\n=== VALIDATION SIMULATION ===');
// Simulate validation issues
parsedQuiz.questions.forEach((question, index) => {
  console.log(`\nQuestion ${index + 1}: ${question.question_text}`);
  console.log(`Type: ${question.question_type}`);
  console.log(`Options:`, question.options);
  console.log(`Answer data:`, question.answer_data);

  // Check what validation expects vs what we have
  if (question.question_type === 'multiple_choice') {
    console.log(`  Validation expects: choices array & correct_answers array`);
    console.log(`  We have: choices=${!!question.options.choices}, correct_answers=${!!question.answer_data.correct_answers}`);
  } else if (question.question_type === 'true_false') {
    console.log(`  Validation expects: correct_answers array with 1 item`);
    console.log(`  We have: correct_answer=${question.answer_data.correct_answer}, correct_answers=${!!question.answer_data.correct_answers}`);
  } else if (question.question_type === 'text_input') {
    console.log(`  Validation expects: correct_answers array`);
    console.log(`  We have: correct_answer=${question.answer_data.correct_answer}, correct_answers=${!!question.answer_data.correct_answers}`);
  }
});