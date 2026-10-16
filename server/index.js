const express = require('express');
const cors = require('cors');

const app = express();          // ≈ WebApplication.CreateBuilder
app.use(cors());                // allow the React dev server to call us
app.use(express.json());        // parse JSON bodies (≈ [FromBody] model binding)

// ≈ [HttpGet("api/hello")]
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node' });
});

// ≈ [HttpPost("api/echo")]
app.post('/api/echo', (req, res) => {
  res.json({ you_sent: req.body });
});

app.listen(3001, () => console.log('Server on http://localhost:3001'));