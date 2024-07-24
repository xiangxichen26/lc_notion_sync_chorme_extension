// please replace the NOTION_TOKEN, DATABASE_ID and PROXY_URL with your own values
const NOTION_TOKEN = ''; 
const DATABASE_ID = '';
const PROXY_URL = 'http://localhost:3000/notion';  // or your deployed proxy server URL

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToNotion') {
    const { title, contentBlocks, difficulty, topics, url, problemNumber, code } = request.data;
    console.log("Received data in background script:", request.data);

    createNotionPage(title, contentBlocks, difficulty, topics, url, parseInt(problemNumber, 10), code)
      .then(notionResponse => {
        console.log("Notion response:", notionResponse);
        sendResponse({ success: true, data: notionResponse });
      })
      .catch(error => {
        console.error("Error saving to Notion:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});

async function createNotionPage(title, contentBlocks, difficulty, topics, url, problemNumber, code) {
  const apiUrl = `${PROXY_URL}/v1/pages`;
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  const databaseEntryBody = {
    parent: { database_id: DATABASE_ID },
    properties: {
      'Problem': { number: problemNumber },
      'Name': { title: [{ text: { content: title } }] },
      'Link': { url: url },
      'Difficulty': { select: { name: difficulty } },
      'Topic': { multi_select: topics.split(', ').map(topic => ({ name: topic })) }
    }
  };

  console.log("Creating database entry:", JSON.stringify(databaseEntryBody, null, 2));

  const createResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(databaseEntryBody)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create database entry: ${createResponse.statusText} - ${errorText}`);
  }

  const createData = await createResponse.json();
  const pageId = createData.id;

  return updateNotionPage(contentBlocks, code, pageId);
}

async function updateNotionPage(contentBlocks, code, pageId) {
  const apiUrl = `${PROXY_URL}/v1/blocks/${pageId}/children`;
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  const children = [];

  children.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: 'Problem' } }] }
  });

  children.push(...contentBlocks);

  children.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: 'Solution' } }] }
  });

  children.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: 'Clarification & Difficulties' } }] }
  });

  children.push({
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: 'Code' } }] }
  });

  children.push({
    object: 'block',
    type: 'code',
    code: { rich_text: [{ type: 'text', text: { content: code } }], language: 'python' }
  });

  const updateBody = { children };

  console.log("Updating page content:", JSON.stringify(updateBody, null, 2));

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify(updateBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update page content: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
