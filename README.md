# Online Examination System (LLD)

A small runnable REST API demonstration using Node.js, Express, Mongoose and MongoDB.

## Requirements
- Node.js LTS
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- Postman (recommended)

## Setup on Windows PowerShell
1. Install Node.js LTS and MongoDB Community Server.
2. Open this folder in VS Code.
3. Copy `.env.example` to `.env`.
4. In the terminal, run:
   ```powershell
   npm install
   npm run seed
   npm run dev
   ```
5. Visit `http://localhost:5000` and `http://localhost:5000/health`.

If MongoDB is not running, start the MongoDB Windows service from Services (`services.msc`) or use the MongoDB service installed on your machine.

## Demo identity
For this educational demo, identify the student by adding this HTTP header to protected requests:
`x-student-id: STU101`

This is **not production authentication**. Replace it with JWT/session authentication before deployment.

## API list
| Method | URL | Notes |
|---|---|---|
| GET | `/api/v1/exams` | List available exams |
| GET | `/api/v1/exams/EX101/questions` | Questions without correct answers |
| POST | `/api/v1/exams/EX101/attempts` | Start attempt; requires `x-student-id` |
| PUT | `/api/v1/attempts/{attemptId}/answers/{questionId}` | Save/update answer |
| POST | `/api/v1/attempts/{attemptId}/submit` | Submit and evaluate |
| GET | `/api/v1/attempts/{attemptId}/result` | Retrieve result |

## Postman walkthrough
Base URL: `http://localhost:5000`

### 1. List exams
`GET http://localhost:5000/api/v1/exams`

### 2. Get questions
`GET http://localhost:5000/api/v1/exams/EX101/questions`

### 3. Start attempt
`POST http://localhost:5000/api/v1/exams/EX101/attempts`
Header: `x-student-id: STU101`
Body: none.

Copy `attemptId` from the response.

### 4. Save answers
`PUT http://localhost:5000/api/v1/attempts/PASTE_ATTEMPT_ID/answers/Q101`
Headers:
- `Content-Type: application/json`
- `x-student-id: STU101`

Body (raw JSON):
```json
{ "selectedOption": "B" }
```

Repeat for `Q102` (correct option `C`) and `Q103` (correct option `B`).

### 5. Submit exam
`POST http://localhost:5000/api/v1/attempts/PASTE_ATTEMPT_ID/submit`
Header: `x-student-id: STU101`
Body: none.

Expected marks if all three answers are correct: `5` out of `5`.

### 6. Get result
`GET http://localhost:5000/api/v1/attempts/PASTE_ATTEMPT_ID/result`
Header: `x-student-id: STU101`

## Important limitations
- Header-based student identity is only for local demonstrations, not secure authentication.
- This is a synchronous evaluation demo, not the scalable HLD implementation.
- For a production exam system, add proper authentication, audit logs, stronger concurrency controls, autosave, rate limiting and automated tests.
