// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Example database (in-memory for simplicity)
let quizzes = [];
let quizIdCounter = 1;

// Routes
// Get all quizzes
app.get('/quizzes', (req, res) => {
  res.json(quizzes);
});

// Create a quiz
app.post('/quizzes', (req, res) => {
  const quiz = { id: quizIdCounter++, ...req.body };
  quizzes.push(quiz);
  res.status(201).json({ message: 'Quiz created successfully', quiz });
});

// Get a specific quiz
app.get('/quizzes/:quizId', (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) {
    res.status(404).json({ message: 'Quiz not found' });
  } else {
    res.json(quiz);
  }
});

// Submit answers for a quiz
app.post('/quizzes/:quizId/submit', (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const answers = req.body.answers;
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) {
    res.status(404).json({ message: 'Quiz not found' });
  } else {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        score++;
      }
    });
    res.json({ score, totalQuestions: quiz.questions.length });
  }
});

// Serve the index.html for any unknown routes (for frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Quiz platform server listening at http://localhost:${port}`);
});
