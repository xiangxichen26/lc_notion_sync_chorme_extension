// please replace the NOTION_TOKEN, DATABASE_ID and PROXY_URL with your own values
const NOTION_TOKEN = ''; 
const DATABASE_ID = '';
const PROXY_URL = 'http://localhost:3000/notion'; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToNotion') {
    const { title, content, difficulty, topics, url, problemNumber, code } = request.data;
    console.log("Received data in background script:", request.data); 

    createNotionPage(title, content, difficulty, topics, url, parseInt(problemNumber, 10), code) // ensure problemNumber is a number
      .then(notionResponse => {
        console.log("Notion response:", notionResponse);
        sendResponse({ success: true, data: notionResponse });
      })
      .catch(error => {
        console.error("Error saving to Notion:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // keep the message channel open until the promise is resolved
  }
});

async function createNotionPage(title, content, difficulty, topics, url, problemNumber, code) {
  const apiUrl = `${PROXY_URL}/v1/pages`; // use the proxy server URL
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  // create a new database entry
  const databaseEntryBody = {
    parent: { database_id: DATABASE_ID },
    properties: {
      'Problem': { 
        number: problemNumber
      },
      'Name': { 
        title: [{ 
          text: { 
            content: title 
          } 
        }] 
      },
      'Link': { 
        url: url 
      },
      'Difficulty': { 
        select: { 
          name: difficulty 
        } 
      },
      'Topic': { 
        multi_select: topics.split(', ').map(topic => ({ name: topic })) 
      }
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

  // console.log("Created page with ID:", pageId);

  return updateNotionPage(content, code, pageId);
}

// update the newly created page with the content and code
async function updateNotionPage(content, code, pageId) {
  const apiUrl = `${PROXY_URL}/v1/blocks/${pageId}/children`; // use the proxy server URL
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  // update the page content with the problem description and code
  const updateBody = {
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: 'Problem' 
            } 
          }] 
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: content 
            },
          }]
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: 'Solution' 
            } 
          }] 
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: 'Clarification & Difficulties' 
            } 
          }] 
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: 'Code' 
            } 
          }] 
        }
      }, 
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: ""
            } 
          }] 
        }
      },
      {
        object: 'block',
        type: 'code',
        code: { 
          rich_text: [{ 
            type: 'text', 
            text: { 
              content: code 
            } 
          }], 
          language: 'python', // you can change the language here
          caption: []
        }
      }
    ]
  };

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
