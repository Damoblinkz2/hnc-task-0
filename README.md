# Backend Stage 1

A Node.js/Express.js backend API that provides user information, string analysis, and filtering capabilities.

## Description

This project is an Express.js server that offers multiple endpoints for user information, string analysis, and advanced filtering. It demonstrates API development, data persistence using JSON files, natural language query parsing, and comprehensive error handling.

## Features

- **User Information**: Returns static user data including email, name, and tech stack, along with a random cat fact.
- **String Analysis**: Analyzes strings for properties like length, unique characters, word count, palindrome status, SHA256 hash, and character frequency.
- **Data Persistence**: Stores analyzed strings in a JSON file for retrieval and filtering.
- **Advanced Filtering**: Supports query-based filtering by various string properties.
- **Natural Language Queries**: Parses natural language queries into filter criteria for intuitive searching.
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes.
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

### API Endpoints

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

#### POST /strings

Adds a new string to the collection after analyzing its properties.

**Request Body:**

```json
{
  "value": "example string"
}
```

**Response (201 Created):**

```json
{
  "id": 1234.567,
  "value": "example string",
  "properties": {
    "length": 14,
    "is_palindrome": false,
    "unique_characters": 10,
    "word_count": 2,
    "sha256_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "character_frequency_map": {
      "e": 3,
      "x": 1,
      "a": 2,
      "m": 1,
      "p": 1,
      "l": 1,
      "s": 1,
      "t": 1,
      "r": 1,
      "i": 1,
      "n": 1,
      "g": 1
    }
  },
  "created_at": "2023-10-01T12:00:00.000Z"
}
```

**Error Responses:**

- 400 Bad Request: Invalid input (non-string or empty value)
- 409 Conflict: String already exists
- 500 Internal Server Error

#### GET /strings

Retrieves strings with optional filtering.

**Query Parameters:**

- `is_palindrome` (boolean): Filter by palindrome status
- `min_length` (number): Minimum length filter
- `max_length` (number): Maximum length filter
- `word_count` (number): Exact word count filter
- `contains_character` (string): Character that must be present

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1234.567,
      "value": "example string",
      "properties": { ... },
      "created_at": "2023-10-01T12:00:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "min_length": "5"
  }
}
```

**Error Responses:**

- 400 Bad Request: Invalid query parameters
- 500 Internal Server Error

#### GET /strings/:id

Retrieves a specific string by its ID.

**Response (200 OK):**

```json
{
  "id": 1234.567,
  "value": "example string",
  "properties": { ... },
  "created_at": "2023-10-01T12:00:00.000Z"
}
```

**Error Responses:**

- 404 Not Found: String not found
- 500 Internal Server Error

#### GET /strings/filter-by-natural-language

Filters strings using natural language queries.

**Query Parameter:**

- `query` (string): Natural language query (e.g., "single word palindromic strings")

**Response (200 OK):**

```json
{
  "data": [ ... ],
  "count": 1,
  "interpreted_query": {
    "original": "single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**

- 400 Bad Request: Invalid or unparseable query
- 422 Unprocessable Entity: Conflicting filters
- 500 Internal Server Error

#### DELETE /strings/:string_value

Deletes a string by its value.

**Response (204 No Content):** Success

**Error Responses:**

- 404 Not Found: String does not exist
- 500 Internal Server Error

## Dependencies

- [Express](https://expressjs.com/) (^5.1.0): Web framework for Node.js.

## Scripts

- `npm start`: Starts the server using Node.js.

## Author

Adedamola Olatunji

## License

ISC
