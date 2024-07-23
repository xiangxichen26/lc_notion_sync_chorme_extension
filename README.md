# lc_notion_sync_chorme_extension
An chorme extension that can help you insert the leetcode problems and your code into your notion data base

# LeetCode to Notion

This project allows users to automatically save LeetCode problems and solutions to a Notion database using a Chrome extension and a proxy server.

## Features

- Automatically fetch LeetCode problem details and code.
- Save the fetched data to a Notion database.
- Use a proxy server to handle CORS issues.

## Components

- `leetcode_to_notion/`: The Chrome extension to fetch LeetCode data.
- `notion-proxy/`: The proxy server to handle Notion API requests.

## Installation

### Step 1: Clone the repository

```
git clone https://github.com/xiangxichen26/lc_notion_sync_chorme_extension.git
cd lc_notion_sync_chorme_extension
```

### Step 2: Set up the Notion Proxy
1. Navigate to the **notion-proxy** directory:
```
cd notion-proxy
```
2. Install dependencies:
```
npm install
```
3. Create a .env file in the notion-proxy directory and add your Notion API token:
```
NOTION_TOKEN=your_notion_token
PORT=3000
```
4. Start the proxy server:
```
npm start
```

### Step 3: Set up the Chrome Extension
1. Open Chrome and go to **chrome://extensions/**.
2. Enable "**Developer mode**" (toggle on the top right).
3. Click "Load unpacked" and select the **leetcode_to_notion** directory.
4. Update the **background.js file** in the extension to point to your proxy server URL:
```
const PROXY_URL = 'http://localhost:3000/notion'; // or your deployed server URL
```
