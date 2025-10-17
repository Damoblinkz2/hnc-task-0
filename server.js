const express = require("express");

const app = express();

const PORT = 3000;
app.use(express.json());

// /me endpoint
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
