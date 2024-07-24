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
### Step 2: Create the Notion Api and get the token & Database Id
1. Go to https://www.notion.so/profile/integrations
2. Create an api
![image](https://github.com/user-attachments/assets/e3008ae2-1475-45b2-8006-9646206b75e9)
3. Get the api token
![image](https://github.com/user-attachments/assets/f12ccde9-fdfb-407a-a8fc-d124c9cb85d8)
4. Duplicate my notion template
https://www.notion.so/0619986c00ba45c9bea6db875920ab30?v=73a2ebfcd91744e2a08154fdffe8333f&pvs=4
5. Get your database id:
![image](https://github.com/user-attachments/assets/1cff2ebb-8464-4958-a471-0ab5767a50d6)
6. Connect your database with your api
![image](https://github.com/user-attachments/assets/17810d8b-cf5c-46eb-872a-af3ddbb16c72)
7. Navigate to the **lc_to_notion** directory:
```
cd lc_to_notion
```
8. Navigate to the **background.js** file and add your notion api token, database id and port
```
const NOTION_TOKEN = 'your api token';
const DATABASE_ID = 'your database id';
const PROXY_URL = 'your PROXY_URL';
```

### Step 3: Set up the Notion Proxy
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


### Step 4: Set up the Chrome Extension
1. Open Chrome and go to **chrome://extensions/**.
2. Enable "**Developer mode**" (toggle on the top right).
3. Click "Load unpacked" and select the **lc_to_notion** directory.
4. Update the **background.js file** in the extension to point to your proxy server URL:
```
const PROXY_URL = 'http://localhost:3000/notion'; // or your deployed server URL
```
## Usage
1. Navigate to a LeetCode problem page.
2. Click on the Chrome extension icon.
3. The problem details and code will be automatically saved to your Notion database.

