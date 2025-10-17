# Backend Stage 0

A simple Node.js/Express.js backend API that provides user information along with a random cat fact.

## Description

This project is a basic Express.js server that exposes a single endpoint (`/me`) to retrieve user details and a fun cat fact fetched from an external API. It's designed as a starting point for backend development, demonstrating API integration, error handling, and JSON responses.

## Features

- **User Information**: Returns static user data including email, name, and tech stack.
- **Cat Fact Integration**: Fetches a random cat fact from [Cat Fact API](https://catfact.ninja/).
- **Error Handling**: Includes middleware for handling internal server errors.
- **Timestamped Responses**: Each response includes a timestamp for logging purposes.

## Installation

1. Ensure you have Node.js installed (version 14 or higher recommended).
2. Clone or download the project files.
3. Navigate to the project directory.
4. Install dependencies:

   ```bash
   npm install
   ```

## Usage

Start the server:

```bash
node server.js
```

The server will run on `http://localhost:3000`.

### API Endpoint

#### GET /me

Retrieves user information and a random cat fact.

**Response (200 OK):**

```json
{
  "status": "success",
  "user": {
    "email": "adedamolatomide@gmail.com",
    "name": "Adedamola Olatunji",
    "stack": "node.js/express"
  },
  "timestamp": "2023-10-01T12:00:00.000Z",
  "fact": "Cats have over 20 muscles that control their ears."
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "status": "error",
  "message": "Internal Server Error",
  "timestamp": "2023-10-01T12:00:00.000Z"
}
```

## Dependencies

- [Express](https://expressjs.com/) (^5.1.0): Web framework for Node.js.

## Scripts

- `npm start`: Starts the server using Node.js.

## Author

Adedamola Olatunji

## License

ISC
