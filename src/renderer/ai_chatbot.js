"use strict";

const chatLog = document.querySelector('#chat_log');
const chatInput = document.querySelector('#chat_input');
const chatSendBtn = document.querySelector('#chat_send_btn');

let last_context = [];

chatInput.addEventListener('keypress', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		chatSendBtn.click();
	}
});

chatSendBtn.addEventListener('click', () => {
	const userMessage = chatInput.value.trim();
	if (userMessage) {
		const allMoves = Array.from(movelist.querySelectorAll('span')).map(span => span.textContent.trim()).join(' ');
		const prompt_prefix = `You must only answer chess-related questions, responding to greetings and thank you is also okay. ${allMoves? (`These are the chess moves I made till now: "${allMoves}"`) : 'Ask if I want to discuss about some opening moves'}. Now, give a short answer to this prompt based on it:`

		const userMessageDiv = document.createElement('div');
		userMessageDiv.className = 'user_message';
		userMessageDiv.textContent = userMessage;
		chatLog.appendChild(userMessageDiv);
		chatInput.value = '';

		const llamaResponseDiv = document.createElement('div');
		llamaResponseDiv.className = 'llama_response';
		chatLog.appendChild(llamaResponseDiv);

		fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ model: "llama3.1", prompt: prompt_prefix + userMessage, context: last_context })
		})
			.then(response => {
				const reader = response.body.getReader();
				const decoder = new TextDecoder('utf-8');
				let partialResponse = '';

				function readStream() {
					reader.read().then(({ done, value }) => {
						if (done) {
							return;
						}

						const chunk = decoder.decode(value, { stream: true });
						try {
							const responses = chunk.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));
							responses.forEach(({response: message, context: llama_context}) => {
								if (message) {
									partialResponse += message;
								}

								if (llama_context) {
									last_context = llama_context;
								}
							});
						} catch (error) {
							console.error('Error parsing JSON response:', error);
						}

						llamaResponseDiv.textContent = partialResponse;
						chatLog.scrollTop = chatLog.scrollHeight;

						readStream();
					}).catch(error => {
						console.error('Error reading Ollama stream:', error);
					});
				}

				readStream();
			})
			.catch(error => {
				console.error('Error fetching Ollama response:', error);
			});
	}
});
