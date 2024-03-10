import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Make sure to create this CSS file in your project

function App() {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState([]); // Stores the conversation history
    const [isLoading, setIsLoading] = useState(false);
    const serverURL = "http://localhost:3050";

    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!question.trim()) return;

        // Keep track of conversations visually by using an array.
        setConversation(conversation => [...conversation, { type: 'question', text: question }]);

        setIsLoading(true);

        try {
            const response = await axios.get(`${serverURL}/gamequestion`, { params: { question } });
            console.log(response.data.answer);


            const answerText = response.data.answer;

            // Fight the LLM's random json formatting. There's probably a better way to do this.
            let parsedAnswerText;
            try {

                const parsedResponse = JSON.parse(answerText);
                parsedAnswerText = parsedResponse.answer; // Use the 'answer' part of the parsed object
            } catch (error) {
                // If parsing fails, use the original 'answerText'
                console.error('Error parsing the answer text:', error);
                parsedAnswerText = answerText;
            }

            // Add the LLMs answer to the conversation
            setConversation(conversation => [...conversation, { type: 'answer', text: parsedAnswerText }]);
        } catch (error) {
            console.error('There was an error fetching the answer:', error);
            setConversation(conversation => [...conversation, { type: 'error', text: 'Failed to fetch answer. Please try again.' }]);
        } finally {
            setIsLoading(false);
            setQuestion('');
        }
    };



//visuals and disable the button if there's no text or an active fetch is happening
    return (
        <div className="App">
            <h1>Game Insight Chatbot</h1>
            <div className="chatbox">
                {conversation.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Ask a question about a game..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !question.trim()}>Send</button>
            </form>
        </div>
    );
}

export default App;
