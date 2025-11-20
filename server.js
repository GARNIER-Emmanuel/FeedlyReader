const express = require('express');
const axios = require('axios');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/extract-full-article', async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    res.json({ title: article.title, content: article.content });
  } catch (error) {
    console.error('Error extracting article:', error);
    res.status(500).json({ error: 'Failed to extract article' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
