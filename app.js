const startButton = document.getElementById('start-button');
const transcriptDiv = document.getElementById('transcript');

let conversationMemory = [
    {"role": "system", "content": "You are a customer service assistant for tech support. " +
                                  "Your job is to provide helpful and relevant answers to technical questions."}
];

startButton.addEventListener('click', () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = true;

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptDiv.textContent = transcript;
        sendToDeepSeek(transcript);  // Send spoken text to DeepSeek
    });

    recognition.start();
});

function sendToDeepSeek(message) {
    const apiKey = "sk-37a9e66385ad40be88e98b3aa5d0739c"; // Your DeepSeek API key
    const url = "https://api.deepseek.com/v1/chat/completions"; // DeepSeek API URL

    // Add user message to conversation memory
    conversationMemory.push({"role": "user", "content": message});

    // Limit memory to the last 10 messages (keeping the system message)
    if (conversationMemory.length > 11) {
        conversationMemory = conversationMemory.slice(-10);
    }

    const data = {
        model: "deepseek-chat",
        messages: conversationMemory,
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        const chatResponse = data.choices[0].message.content;
        transcriptDiv.textContent += `\nDeepSeek: ${chatResponse}`;

        // Add AI response to conversation memory
        conversationMemory.push({"role": "assistant", "content": chatResponse});
    })
    .catch(error => console.error('Error:', error));
}