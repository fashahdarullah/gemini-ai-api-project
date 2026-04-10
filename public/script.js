const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');

const conversation = [];

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) {
    return;
  }

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  input.value = '';
  setLoadingState(true);

  const thinkingMessageEl = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Chat response data:', data);
    const aiReply = typeof data.result === 'string' ? data.result.trim() : '';

    if (!aiReply) {
      thinkingMessageEl.textContent = 'Sorry, no response received.';
      return;
    }

    thinkingMessageEl.textContent = aiReply;
    conversation.push({ role: 'model', text: aiReply });
  } catch (error) {
    console.error('Chat request failed:', error);
    thinkingMessageEl.textContent = 'Failed to get response from server.';
  } finally {
    setLoadingState(false);
    input.focus();
    scrollChatToBottom();
  }
});

function appendMessage(sender, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', sender);
  messageEl.textContent = text;

  chatBox.appendChild(messageEl);
  scrollChatToBottom();

  return messageEl;
}

function setLoadingState(isLoading) {
  input.disabled = isLoading;
  if (submitButton) {
    submitButton.disabled = isLoading;
  }
}

function scrollChatToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
