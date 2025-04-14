"use strict";

const chatLog = document.querySelector('#chat_log');
const chatInput = document.querySelector('#chat_input');
const chatSendBtn = document.querySelector('#chat_send_btn');

chatSendBtn.addEventListener('click', () => {
	const userMessage = chatInput.value.trim();
	if (userMessage) {
		const userMessageDiv = document.createElement('div');
		userMessageDiv.textContent = 'You: ' + userMessage;
		chatLog.appendChild(userMessageDiv);
		chatInput.value = '';

		fetch('http://localhost:5000/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ message: userMessage })
		})
			.then(response => response.json())
			.then(data => {
				// Display Llama's response
				const llamaMessageDiv = document.createElement('div');
				llamaMessageDiv.textContent = 'Llama: ' + data.response;
				chatLog.appendChild(llamaMessageDiv);

				// Scroll to the bottom of the chat log
				chatLog.scrollTop = chatLog.scrollHeight;
			})
			.catch(error => {
				console.error('Error communicating with Llama:', error);
			});
	}
});
