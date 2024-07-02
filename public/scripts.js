const apiUrl = 'http://localhost:3000'; // Replace with your backend server URL

function showCreateQuizForm() {
  document.getElementById('createQuizForm').style.display = 'block';
}

function addQuestion() {
  const questionsDiv = document.getElementById('questions');
  const questionCount = questionsDiv.getElementsByClassName('question').length;
  const newQuestionDiv = document.createElement('div');
  newQuestionDiv.classList.add('question');
  newQuestionDiv.innerHTML = `
    <label>Question:</label>
    <input type="text" name="questions[${questionCount}][text]" required>
    <label>Answers:</label>
    <input type="text" name="questions[${questionCount}][answers][]" required>
    <input type="text" name="questions[${questionCount}][answers][]" required>
    <input type="text" name="questions[${questionCount}][answers][]" required>
    <input type="text" name="questions[${questionCount}][answers][]" required>
    <label>Correct Answer:</label>
    <input type="number" name="questions[${questionCount}][correctAnswer]" required>
  `;
  questionsDiv.appendChild(newQuestionDiv);
}

function createQuiz(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const quizData = {
    title: formData.get('title'),
    description: formData.get('description'),
    questions: []
  };

  formData.forEach((value, key) => {
    const match = key.match(/questions\[(\d+)]\[(\w+)]\[(\d+)?\]?/);
    if (match) {
      const questionIndex = match[1];
      const questionKey = match[2];
      const answerIndex = match[3];

      if (!quizData.questions[questionIndex]) {
        quizData.questions[questionIndex] = {
          text: '',
          answers: [],
          correctAnswer: null
        };
      }

      if (questionKey === 'text') {
        quizData.questions[questionIndex].text = value;
      } else if (questionKey === 'answers') {
        quizData.questions[questionIndex].answers[answerIndex] = value;
      } else if (questionKey === 'correctAnswer') {
        quizData.questions[questionIndex].correctAnswer = parseInt(value, 10);
      }
    }
  });

  fetch(`${apiUrl}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quizData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }
      return response.json();
    })
    .then(() => {
      alert('Quiz created successfully!');
      document.getElementById('quizForm').reset();
      document.getElementById('createQuizForm').style.display = 'none';
      loadQuizzes();
    })
    .catch(error => {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    });
}

function loadQuizzes() {
  fetch(`${apiUrl}/quizzes`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      return response.json();
    })
    .then(data => {
      const quizListDiv = document.getElementById('quizList');
      quizListDiv.innerHTML = '';
      data.forEach(quiz => {
        const quizDiv = document.createElement('div');
        quizDiv.classList.add('quiz');
        quizDiv.innerHTML = `
          <h2>${quiz.title}</h2>
          <p>${quiz.description}</p>
          <button onclick="takeQuiz(${quiz.id})">Take Quiz</button>
        `;
        quizListDiv.appendChild(quizDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching quizzes:', error);
      alert('Failed to fetch quizzes. Please try again.');
    });
}

function takeQuiz(quizId) {
  fetch(`${apiUrl}/quizzes/${quizId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      return response.json();
    })
    .then(quiz => {
      const quizForm = document.createElement('form');
      quizForm.innerHTML = `
        <h2>${quiz.title}</h2>
        <p>${quiz.description}</p>
      `;

      if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error('Quiz questions are missing or not an array');
      }

      quiz.questions.forEach((question, index) => {
        if (!question.text || !Array.isArray(question.answers) || question.answers.length === 0) {
          throw new Error(`Question ${index} data is missing or invalid`);
        }

        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `<p>${question.text}</p>`;

        question.answers.forEach((answer, i) => {
          const answerInput = document.createElement('input');
          answerInput.type = 'radio';
          answerInput.name = `question${index}`;
          answerInput.value = i;

          const answerLabel = document.createElement('label');
          answerLabel.innerHTML = answer;

          questionDiv.appendChild(answerInput);
          questionDiv.appendChild(answerLabel);
          questionDiv.appendChild(document.createElement('br'));
        });

        quizForm.appendChild(questionDiv);
      });

      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Submit Quiz';

      quizForm.appendChild(submitButton);

      quizForm.onsubmit = function(event) {
        event.preventDefault();

        const formData = new FormData(quizForm);
        const answers = [];

        for (let pair of formData.entries()) {
          const [key, value] = pair;
          if (key.startsWith('question')) {
            answers.push(parseInt(value, 10));
          }
        }

        submitQuiz(quizId, answers);
      };

      const quizListDiv = document.getElementById('quizList');
      quizListDiv.innerHTML = '';
      quizListDiv.appendChild(quizForm);
    })
    .catch(error => {
      console.error('Error taking quiz:', error);
      alert('Failed to load quiz details. Please try again.');
      loadQuizzes(); // Reload quizzes on error
    });
}

function submitQuiz(quizId, answers) {
  fetch(`${apiUrl}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ answers })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      return response.json();
    })
    .then(data => {
      const scoreMessage = `You scored ${data.score} out of ${data.totalQuestions}`;
      const quizResultDiv = document.createElement('div');
      quizResultDiv.innerHTML = `<p>${scoreMessage}</p>`;
      const quizListDiv = document.getElementById('quizList');
      quizListDiv.innerHTML = '';
      quizListDiv.appendChild(quizResultDiv);
    })
    .catch(error => {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    });
}

// Initial load of quizzes
loadQuizzes();
