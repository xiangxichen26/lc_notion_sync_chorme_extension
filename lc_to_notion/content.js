chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'fetchLeetCodeData') {
	  // get the title from the URL
	  const url = window.location.href;
	  const titleMatch = url.match(/leetcode.com\/problems\/(.*?)\//);
  
	  let title = '';
	  let problemNumber = '';
	  if (titleMatch) {
		// replace dashes with spaces
		title = titleMatch[1].replace(/-/g, ' '); 
	  }
  
	  // get the title 
	  const titleElement = document.querySelector(`a[href*="/problems/${titleMatch[1]}"]`);
  
	  if (titleElement) {
		const titleText = titleElement.innerText;
		const splitTitle = titleText.split('. ');
		if (splitTitle.length === 2) {
		  problemNumber = splitTitle[0];
		  title = splitTitle[1];
		}
	  }
  
	  // get the content, difficulty, topics, and code
	  const contentElement = document.querySelector('.elfjS'); 
	  const difficultyElement = document.querySelector('div[class*="text-difficulty-"]'); 
	  const topicsContainer = document.querySelector('.mt-2.flex.flex-wrap.gap-1.pl-7'); 
      const topicsElements = topicsContainer ? topicsContainer.querySelectorAll('a') : []; 
	  const codeContainer = document.querySelector('.view-lines'); 
  
	  const content = contentElement ? contentElement.innerText : '';
	  const difficulty = difficultyElement ? difficultyElement.innerText : '';
	  const topics = Array.from(topicsElements)
                        .map(el => el.innerText)
                        .join(', ');
	  const code = Array.from(codeContainer.querySelectorAll('.view-line'))
                      .map(line => line.innerText)
                      .join('\n');


  
	  // print the data to the console
	  console.log("Title:", title);
	  console.log("Content:", content);
	  console.log("Difficulty:", difficulty);
	  console.log("Topics:", topics);
	  console.log("Code:", code);
	  console.log("URL:", url);
	  console.log("Problem Number:", problemNumber);
  
	  // check if all necessary data is available
	  if (title && content && difficulty && topics && code && url && problemNumber) {
		// send the data to the background script
		chrome.runtime.sendMessage({
		  action: 'saveToNotion',
		  data: {
			title,
			content,
			difficulty,
			topics,
			url,
			problemNumber,
			code
		  }
		}, response => {
		  if (chrome.runtime.lastError) {
			console.error("Error sending message to background script:", chrome.runtime.lastError.message);
		  } else if (response) {
			if (response.success) {
			  console.log("Data successfully saved to Notion:", response.data);
			} else {
			  console.error("Failed to save data to Notion:", response.error);
			}
		  } else {
			console.error("No response received from background script.");
		  }
		});
	  } else {
		console.error("Failed to retrieve all necessary data from the LeetCode page.");
		if (!titleElement) console.error("Title element not found");
		if (!title) console.error("Title not found");
		if (!content) console.error("Content not found");
		if (!difficulty) console.error("Difficulty not found");
		if (!topics) console.error("Topics not found");
		if (!code) console.error("Code not found");
		if (!url) console.error("URL not found");
		if (!problemNumber) console.error("Problem Number not found");
	  }
	}
  });
  