chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'fetchLeetCodeData') {
	  const url = window.location.href;
	  const titleMatch = url.match(/leetcode.com\/problems\/(.*?)\//);
  
	  let title = '';
	  let problemNumber = '';
	  if (titleMatch) {
		title = titleMatch[1].replace(/-/g, ' ');
	  }
  
	  const titleElement = document.querySelector(`a[href*="/problems/${titleMatch[1]}"]`);
  
	  if (titleElement) {
		const titleText = titleElement.innerText;
		const splitTitle = titleText.split('. ');
		if (splitTitle.length === 2) {
		  problemNumber = splitTitle[0];
		  title = splitTitle[1];
		}
	  }
  
	  const contentElement = document.querySelector('.elfjS');
	  const difficultyElement = document.querySelector('div[class*="text-difficulty-"]');
	  const topicsContainer = document.querySelector('.mt-2.flex.flex-wrap.gap-1.pl-7');
	  const topicsElements = topicsContainer ? topicsContainer.querySelectorAll('a') : [];
	  const codeContainer = document.querySelector('.view-lines');
  
	  const content = contentElement ? parseContent(contentElement) : [];
	  const difficulty = difficultyElement ? difficultyElement.innerText : '';
	  const topics = Array.from(topicsElements).map(el => el.innerText).join(', ');
	  const code = Array.from(codeContainer.querySelectorAll('.view-line')).map(line => line.innerText).join('\n');
  
	  console.log("Title:", title);
	  console.log("Content:", JSON.stringify(content, null, 2));
	  console.log("Difficulty:", difficulty);
	  console.log("Topics:", topics);
	  console.log("Code:", code);
	  console.log("URL:", url);
	  console.log("Problem Number:", problemNumber);
  
	  if (title && content.length > 0 && difficulty && topics && code && url && problemNumber) {
		chrome.runtime.sendMessage({
		  action: 'saveToNotion',
		  data: {
			title,
			contentBlocks: content,
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
		if (!content.length) console.error("Content not found");
		if (!difficulty) console.error("Difficulty not found");
		if (!topics) console.error("Topics not found");
		if (!code) console.error("Code not found");
		if (!url) console.error("URL not found");
		if (!problemNumber) console.error("Problem Number not found");
	  }
	}
  });
  
  function parseContent(contentElement) {
	const contentBlocks = [];
  
	function processNode(node) {
	  if (node.nodeType === Node.TEXT_NODE) {
		return {
		  type: "text",
		  text: { content: node.textContent },
		  annotations: {}
		};
	  } else if (node.nodeType === Node.ELEMENT_NODE) {
		const tag = node.tagName.toLowerCase();
		const isCode = node.tagName === 'CODE';
		const isBold = node.tagName === 'B' || node.tagName === 'STRONG';
		const isItalic = node.tagName === 'EM' || node.tagName === 'I';
		const isUnderline = node.tagName === 'U';
  
		let annotations = {};
		if (isCode) {
		  annotations.code = true;
		}
		if (isBold) {
		  annotations.bold = true;
		}
		if (isItalic) {
		  annotations.italic = true;
		}
		if (isUnderline) {
		  annotations.underline = true;
		}
  
		if (tag === 'img') {
		  const src = node.getAttribute('src');
		  return {
			type: "image",
			image: { type: "external", external: { url: src } }
		  };
		}
  
		const children = Array.from(node.childNodes).map(processNode);
		return children.map(child => ({
		  ...child,
		  annotations: { ...child.annotations, ...annotations }
		}));
	  }
	  return [];
	}
  
	function flattenNodes(nodes) {
	  return nodes.reduce((acc, node) => acc.concat(Array.isArray(node) ? flattenNodes(node) : node), []);
	}
  
	Array.from(contentElement.childNodes).forEach(node => {
	  if (node.tagName === 'UL' || node.tagName === 'OL') {
		const listType = node.tagName === 'UL' ? 'bulleted_list_item' : 'numbered_list_item';
		Array.from(node.children).forEach(li => {
		  const richTextNodes = flattenNodes(Array.from(li.childNodes).map(processNode));
		  if (richTextNodes.length > 0) {
			contentBlocks.push({
			  object: "block",
			  type: listType,
			  [listType]: { rich_text: richTextNodes.filter(rt => rt.text && rt.text.content) }
			});
		  }
		});
	  } else {
		const richTextNodes = flattenNodes(Array.from(node.childNodes).map(processNode));
		if (richTextNodes.length > 0) {
		  contentBlocks.push({
			type: "paragraph",
			paragraph: { rich_text: richTextNodes.filter(rt => rt.text && rt.text.content.trim() !== '') }
		  });
		}
	  }
	});
  
	return contentBlocks;
  }
  