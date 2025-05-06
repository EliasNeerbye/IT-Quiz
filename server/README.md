# IT Quiz Server

Backend server for the IT Quiz application that provides quiz creation, management, and multiplayer functionality.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/it-quiz
SESSION_SECRET=your_strong_session_secret_here
CLIENT_URL=http://localhost:3000
```

3. Start the server:

```bash
node index.js
```

## API Documentation

### Authentication Routes

#### Register

- **POST** `/api/auth/register`
- Creates a new user account
- **Body**:

  ```json
  {
    "email": "user@example.com",
    "username": "user123",
    "password": "password123"
  }
  ```

- **Response**: Returns user data without password

#### Login

- **POST** `/api/auth/login`
- Authenticates a user
- **Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Response**: Returns user data and session

#### Get Current User

- **GET** `/api/auth/me`
- Returns current authenticated user's data
- **Auth Required**: Yes
- **Response**: Returns user profile data

#### Logout

- **POST** `/api/auth/logout`
- Ends user session
- **Auth Required**: Yes

#### Delete Account

- **DELETE** `/api/auth/account`
- Deletes user's own account
- **Auth Required**: Yes

### Quiz Routes

#### Get Public Quizzes

- **GET** `/api/quiz/public`
- Returns all published public quizzes
- **Auth Required**: No

#### Get User's Quizzes

- **GET** `/api/quiz/me`
- Returns all quizzes created by the authenticated user
- **Auth Required**: Yes

#### Get Quiz by ID

- **GET** `/api/quiz/:quizId`
- Returns detailed quiz information
- **Auth Required**: Yes (for private quizzes)

#### Create Quiz

- **POST** `/api/quiz`
- Creates a new quiz draft
- **Auth Required**: Yes
- **Body**:

  ```json
  {
    "title": "Quiz Title",
    "description": "Quiz Description",
    "categoryIds": ["category1Id", "category2Id"]
  }
  ```

- **Optional**: Image file upload

#### Update Quiz

- **PUT** `/api/quiz/:quizId`
- Updates a draft quiz
- **Auth Required**: Yes
- **Body**: Same as create quiz
- **Note**: Only draft quizzes can be updated

#### Add Question

- **POST** `/api/quiz/:quizId/questions`
- Adds a question to a quiz
- **Auth Required**: Yes
- **Body**:

  ```json
  {
    "title": "Question Title",
    "text": "Question Text",
    "type": "multiple-choice|true-false|correct-order|image-reveal",
    "answers": [
      {
        "text": "Answer 1",
        "isCorrect": true
      }
    ],
    "time_limit": 60,
    "max_points": 1000
  }
  ```

- **Optional**: Image file upload

#### Remove Question

- **DELETE** `/api/quiz/:quizId/questions/:questionId`
- Removes a question from a quiz
- **Auth Required**: Yes

#### Publish Quiz

- **POST** `/api/quiz/:quizId/publish`
- Publishes a draft quiz
- **Auth Required**: Yes

#### Delete Quiz

- **DELETE** `/api/quiz/:quizId`
- Deletes a quiz and all associated data
- **Auth Required**: Yes (must be quiz creator)

#### Submit Quiz Attempt

- **POST** `/api/quiz/:quizId/attempt`
- Submits a single-player quiz attempt
- **Auth Required**: Yes
- **Body**:

  ```json
  {
    "score": {
      "points": 1000,
      "correctAnswers": 5,
      "totalQuestions": 10
    }
  }
  ```

#### Get Quiz Leaderboard

- **GET** `/api/quiz/:quizId/leaderboard`
- Returns quiz attempt rankings
- **Auth Required**: Yes

#### Get Categories

- **GET** `/api/quiz/categories`
- Returns all quiz categories
- **Auth Required**: No

#### Create Category (Admin)

- **POST** `/api/quiz/categories`
- Creates a new quiz category
- **Auth Required**: Yes (Admin only)
- **Body**:

  ```json
  {
    "name": "Category Name",
    "description": "Category Description"
  }
  ```

### FAQ Routes

#### Get All FAQs

- **GET** `/api/faq`
- Returns all FAQ entries
- **Auth Required**: No

#### Add FAQ (Admin)

- **POST** `/api/faq`
- Creates a new FAQ entry
- **Auth Required**: Yes (Admin only)
- **Body**:

  ```json
  {
    "question": "FAQ Question",
    "answer": "FAQ Answer",
    "order": 0
  }
  ```

#### Update FAQ (Admin)

- **PUT** `/api/faq/:faqId`
- Updates an FAQ entry
- **Auth Required**: Yes (Admin only)
- **Body**: Same as Add FAQ

#### Delete FAQ (Admin)

- **DELETE** `/api/faq/:faqId`
- Deletes an FAQ entry
- **Auth Required**: Yes (Admin only)

### Admin Routes

#### Get All Users

- **GET** `/api/admin/users`
- Returns all registered users
- **Auth Required**: Yes (Admin only)

#### Delete User

- **DELETE** `/api/admin/users/:userId`
- Deletes a user account
- **Auth Required**: Yes (Admin only)

#### Get All Quizzes

- **GET** `/api/admin/quizzes`
- Returns all quizzes with detailed information
- **Auth Required**: Yes (Admin only)

#### Delete Quiz (Admin)

- **DELETE** `/api/admin/quizzes/:quizId`
- Deletes any quiz
- **Auth Required**: Yes (Admin only)

## WebSocket Events

The server implements real-time multiplayer quiz functionality using Socket.IO. Here are the main events:

### Host Events

- `create_game`: Creates a new multiplayer game session
- `start_game`: Starts the game when enough players have joined

### Player Events

- `join_game`: Joins an existing game using game code
- `submit_answer`: Submits an answer for the current question
- `leave_game`: Leaves the current game

### Game State Events

- `game_created`: Emitted when a new game is created
- `player_joined`: Emitted when a player joins
- `game_started`: Emitted when the game begins
- `next_question`: Emitted when moving to next question
- `question_results`: Emitted after all players answer
- `game_over`: Emitted when the game ends

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication

The server uses session-based authentication. After login, include the session cookie in all subsequent requests that require authentication.

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address to prevent abuse.
