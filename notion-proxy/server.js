import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const NOTION_API_BASE_URL = 'https://api.notion.com';

app.use(bodyParser.json());
app.use(cors());

app.post('/notion/v1/pages', async (req, res) => {
  const notionToken = req.headers['authorization'];
  const notionVersion = req.headers['notion-version'];

  try {
    const response = await fetch(`${NOTION_API_BASE_URL}/v1/pages`, {
      method: 'POST',
      headers: {
        'Authorization': notionToken,
        'Content-Type': 'application/json',
        'Notion-Version': notionVersion
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/notion/v1/blocks/:blockId/children', async (req, res) => {
  const notionToken = req.headers['authorization'];
  const notionVersion = req.headers['notion-version'];
  const blockId = req.params.blockId;

  try {
    const response = await fetch(`${NOTION_API_BASE_URL}/v1/blocks/${blockId}/children`, {
      method: 'PATCH',
      headers: {
        'Authorization': notionToken,
        'Content-Type': 'application/json',
        'Notion-Version': notionVersion
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
