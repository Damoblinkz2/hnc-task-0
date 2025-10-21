/**
 * Backend Stage 1 - Node.js/Express.js API Server
 *
 * This server provides endpoints for user information, string analysis, and filtering.
 * It uses Express.js for routing, crypto for hashing, and fs for file operations.
 */

const express = require("express");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

const app = express();

const PORT = 3000;
app.use(express.json());

/**
 * Analyzes a given string and computes various properties.
 *
 * @param {string} value - The string to analyze.
 * @returns {object} An object containing the string's id, value, properties (length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map), and created_at timestamp.
 */
function analyzeString(value) {
  // Calculate the length of the string
  const length = value.length;

  // Count unique characters using a Set
  const unique_characters = new Set(value).size;

  // Count words by splitting on whitespace and filtering empty strings
  const words = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const word_count = words.length;

  // Build a frequency map of characters
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  // Check if the string is a palindrome (case-insensitive, ignoring non-alphanumeric)
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const is_palindrome = cleaned === cleaned.split("").reverse().join("");

  // Generate SHA256 hash of the string
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  // Generate a random ID (note: this is not unique, consider using UUID for production)
  const id = Math.random() * 10000;

  return {
    id,
    value,
    properties: {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    },
    created_at: new Date(),
  };
}

/**
 * Utility function to check if a character is present in a string.
 *
 * @param {string} str - The string to search in.
 * @param {string} char - The character to search for.
 * @returns {boolean} True if the character is found, false otherwise.
 */
function isCharPresent(str, char) {
  return str.includes(char);
}

/**
 * Checks if the input string already exists in the data array.
 *
 * @param {string} value - The string to check.
 * @param {Array} data - The array of existing string objects.
 * @returns {boolean} True if the string exists, false otherwise.
 */
function checkIfStringExists(value, data) {
  return data.some((item) => item.value === value);
}

/**
 * Parses a natural language query into filter criteria for string properties.
 *
 * @param {string} query - The natural language query string.
 * @returns {object} An object containing parsed filters (e.g., word_count, is_palindrome, min_length, etc.).
 */
function parseNaturalLanguageQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Check for "single word"
  if (lowerQuery.includes("single word")) {
    filters.word_count = 1;
  }

  // Check for "palindromic"
  if (lowerQuery.includes("palindromic")) {
    filters.is_palindrome = true;
  }

  // Check for "longer than X characters"
  const longerMatch = lowerQuery.match(/longer than (\d+) characters/);
  if (longerMatch) {
    filters.min_length = parseInt(longerMatch[1]) + 1;
  }

  // Check for "containing the letter X"
  const letterMatch = lowerQuery.match(/containing the letter ([a-z])/);
  if (letterMatch) {
    filters.contains_character = letterMatch[1];
  }

  // Check for "contain the first vowel"
  if (lowerQuery.includes("contain the first vowel")) {
    filters.contains_character = "a";
  }

  // Check for "shorter than X characters"
  const shorterMatch = lowerQuery.match(/shorter than (\d+) characters/);
  if (shorterMatch) {
    filters.max_length = parseInt(shorterMatch[1]) - 1;
  }

  return filters;
}

/**
 * Checks for conflicting filters in the parsed query.
 *
 * @param {object} filters - The parsed filters object.
 * @returns {boolean} True if there are conflicts (e.g., min_length > max_length), false otherwise.
 */
function hasConflictingFilters(filters) {
  if (
    filters.min_length !== undefined &&
    filters.max_length !== undefined &&
    filters.min_length > filters.max_length
  ) {
    return true;
  }
  // Add more conflict checks if needed
  return false;
}

/**
 * GET /me - Retrieves user information and a random cat fact.
 *
 * Fetches a random cat fact from an external API and returns it along with static user data.
 *
 * @route GET /me
 * @returns {object} JSON response with status, user info, timestamp, and cat fact.
 * @throws {Error} If the external API call fails.
 */
app.get("/me", async (req, res, next) => {
  try {
    const response = await fetch("https://catfact.ninja/fact");
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    const catFact = data.fact;

    res.status(200).json({
      status: "success",
      user: {
        email: "adedamolatomide@gmail.com",
        name: "Adedamola Olatunji",
        stack: "node.js/express",
      },
      timestamp: new Date(),
      fact: catFact,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /strings - Adds a new string to the collection after analysis.
 *
 * Validates the input string, checks for duplicates, analyzes its properties, and stores it in signal.json.
 *
 * @route POST /strings
 * @param {object} req.body - Request body containing { value: string }.
 * @returns {object} JSON response with the analyzed string data.
 * @throws {Error} If validation fails or file operations error.
 */
app.post("/strings", async (req, res, next) => {
  try {
    const { value } = req.body;

    // Validate the input value
    if (!value || typeof value !== "string" || value.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Invalid input: 'value' must be a non-empty string",
        timestamp: new Date(),
      });
    }

    const filePath = path.join(__dirname, "signal.json");
    let data = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (err) {
      // File doesn't exist or invalid, start with empty array
    }

    // Check if the string already exists
    if (checkIfStringExists(value, data)) {
      return res.status(409).json({
        status: "error",
        message: "String already exists",
        timestamp: new Date(),
      });
    }

    const stringCheck = analyzeString(value);
    data.push(stringCheck);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.status(201).json(stringCheck);
  } catch (error) {
    next(error);
  }
});

/**
 * Utility function to check if an object has any of the specified keys.
 *
 * @param {object} obj - The object to check.
 * @param {Array} keys - Array of keys to check for.
 * @returns {boolean} True if the object has at least one of the keys, false otherwise.
 */
const checkKeys = (obj, keys) =>
  keys.some((key) => Object.prototype.hasOwnProperty.call(obj, key));

/**
 * GET /strings - Retrieves strings with optional filtering.
 *
 * Supports query parameters for filtering: is_palindrome, min_length, max_length, word_count, contains_character.
 * Returns all strings if no filters are provided.
 *
 * @route GET /strings
 * @query {boolean} [is_palindrome] - Filter by palindrome status.
 * @query {number} [min_length] - Minimum length filter.
 * @query {number} [max_length] - Maximum length filter.
 * @query {number} [word_count] - Exact word count filter.
 * @query {string} [contains_character] - Character that must be present.
 * @returns {object} JSON response with data array and optional count/filters.
 * @throws {Error} If invalid query parameters are provided.
 */
app.get("/strings", async (req, res, next) => {
  try {
    const val = [
      "is_palindrome",
      "min_length",
      "max_length",
      "word_count",
      "contains_character",
    ];

    if (Object.keys(req.query).length > 0 && !checkKeys(req.query, val)) {
      return res
        .status(400)
        .json({ status: "bad request", message: "wrong query string" });
    }

    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    const filePath = path.join(__dirname, "signal.json");
    let data = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (err) {
      // File doesn't exist, data remains []
    }
    let filtered = data;
    if (is_palindrome !== undefined) {
      const isPal = is_palindrome === "true";
      filtered = filtered.filter(
        (item) => item.properties.is_palindrome === isPal
      );
    }
    if (min_length !== undefined) {
      const minLen = parseInt(min_length);
      if (!isNaN(minLen)) {
        filtered = filtered.filter((item) => item.properties.length >= minLen);
      }
    }
    if (max_length !== undefined) {
      const maxLen = parseInt(max_length);
      if (!isNaN(maxLen)) {
        filtered = filtered.filter((item) => item.properties.length <= maxLen);
      }
    }
    if (word_count !== undefined) {
      const wc = parseInt(word_count);
      if (!isNaN(wc)) {
        filtered = filtered.filter((item) => item.properties.word_count === wc);
      }
    }

    if (contains_character !== undefined) {
      filtered = filtered.filter((item) =>
        isCharPresent(item.value, contains_character)
      );
    }

    const sendBack =
      Object.keys(req.query).length > 0
        ? {
            data: filtered,
            count: filtered.length,
            filters_applied: req.query,
          }
        : {
            data,
          };

    res.status(200).json(sendBack);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /strings/:id - Retrieves a specific string by its ID.
 *
 * @route GET /strings/:id
 * @param {string} id - The ID of the string to retrieve.
 * @returns {object} JSON response with the string data.
 * @throws {Error} If the string is not found.
 */
app.get("/strings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const filePath = path.join(__dirname, "signal.json");
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContent);
    const stringData = data.find((item) => item.id === id);
    if (!stringData) {
      return res.status(404).json({
        status: "error",
        message: "String not found",
        timestamp: new Date(),
      });
    }
    res.status(200).json(stringData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /strings/filter-by-natural-language - Filters strings using natural language query.
 *
 * Parses a natural language query into filters and applies them to the string collection.
 *
 * @route GET /strings/filter-by-natural-language
 * @query {string} query - The natural language query string.
 * @returns {object} JSON response with filtered data, count, and interpreted query.
 * @throws {Error} If query is invalid or conflicting filters are detected.
 */
app.get("/strings/filter-by-natural-language", async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Unable to parse natural language query",
        timestamp: new Date(),
      });
    }

    const parsedFilters = parseNaturalLanguageQuery(query);

    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Unable to parse natural language query",
        timestamp: new Date(),
      });
    }

    if (hasConflictingFilters(parsedFilters)) {
      return res.status(422).json({
        status: "error",
        message: "Query parsed but resulted in conflicting filters",
        timestamp: new Date(),
      });
    }

    const filePath = path.join(__dirname, "signal.json");
    let data = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (err) {
      // File doesn't exist, data remains []
    }

    let filtered = data;

    if (parsedFilters.is_palindrome !== undefined) {
      filtered = filtered.filter(
        (item) => item.properties.is_palindrome === parsedFilters.is_palindrome
      );
    }
    if (parsedFilters.min_length !== undefined) {
      filtered = filtered.filter(
        (item) => item.properties.length >= parsedFilters.min_length
      );
    }
    if (parsedFilters.max_length !== undefined) {
      filtered = filtered.filter(
        (item) => item.properties.length <= parsedFilters.max_length
      );
    }
    if (parsedFilters.word_count !== undefined) {
      filtered = filtered.filter(
        (item) => item.properties.word_count === parsedFilters.word_count
      );
    }
    if (parsedFilters.contains_character !== undefined) {
      filtered = filtered.filter((item) =>
        isCharPresent(item.value, parsedFilters.contains_character)
      );
    }

    res.status(200).json({
      data: filtered,
      count: filtered.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /strings/:string_value - Deletes a string by its value.
 *
 * @route DELETE /strings/:string_value
 * @param {string} string_value - The value of the string to delete.
 * @returns {void} No content response on success.
 * @throws {Error} If the string does not exist.
 */
app.delete("/strings/:string_value", async (req, res, next) => {
  try {
    const { string_value } = req.params;

    const filePath = path.join(__dirname, "signal.json");
    let data = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (err) {
      // File doesn't exist or invalid, start with empty array
    }

    const index = data.findIndex((item) => item.value === string_value);
    if (index === -1) {
      return res.status(404).json({
        status: "error",
        message: "String does not exist in the system",
        timestamp: new Date(),
      });
    }

    data.splice(index, 1);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Catch-all handler for unmatched routes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Not Found",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// General error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.message);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    timestamp: new Date(),
  });
});
