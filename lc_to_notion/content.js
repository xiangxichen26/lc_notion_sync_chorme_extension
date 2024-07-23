chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'fetchLeetCodeData') {
	  // 从URL中提取标题
	  const url = window.location.href;
	  const titleMatch = url.match(/leetcode.com\/problems\/(.*?)\//);
  
	  let title = '';
	  let problemNumber = '';
	  if (titleMatch) {
		title = titleMatch[1].replace(/-/g, ' '); // 将URL中的横线替换为空格
	  }
  
	  // 使用从URL中提取的标题来选择相应的元素
	  const titleElement = document.querySelector(`a[href*="/problems/${titleMatch[1]}"]`);
  
	  if (titleElement) {
		const titleText = titleElement.innerText;
		const splitTitle = titleText.split('. ');
		if (splitTitle.length === 2) {
		  problemNumber = splitTitle[0];
		  title = splitTitle[1];
		}
	  }
  
	  // 使用正确的选择器来提取数据
	  const contentElement = document.querySelector('.elfjS'); // 问题描述的选择器
	  const difficultyElement = document.querySelector('div[class*="text-difficulty-"]'); // 选择难度元素的选择器
	  const topicsContainer = document.querySelector('.mt-2.flex.flex-wrap.gap-1.pl-7'); // topics容器的选择器
      const topicsElements = topicsContainer ? topicsContainer.querySelectorAll('a') : []; // 精确选择topics的a标签
	  const codeContainer = document.querySelector('.view-lines'); // 选择代码元素的选择器
  
	  const content = contentElement ? contentElement.innerText : '';
	  const difficulty = difficultyElement ? difficultyElement.innerText : '';
	  const topics = Array.from(topicsElements)
                        .map(el => el.innerText)
                        .join(', ');
	  const code = Array.from(codeContainer.querySelectorAll('.view-line'))
                      .map(line => line.innerText)
                      .join('\n');


  
	  // 打印提取到的数据到控制台
	  console.log("Title:", title);
	  console.log("Content:", content);
	  console.log("Difficulty:", difficulty);
	  console.log("Topics:", topics);
	  console.log("Code:", code);
	  console.log("URL:", url);
	  console.log("Problem Number:", problemNumber);
  
	  // 检查是否获取到了所有数据
	  if (title && content && difficulty && topics && code && url && problemNumber) {
		// 发送数据到后台脚本
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
  