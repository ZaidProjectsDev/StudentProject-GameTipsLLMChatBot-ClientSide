import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [question, setQuestion] = useState(''); // Holds the question variable and applies it with setQuestion
    const [conversation, setConversation] = useState([]); // Stores the conversation history visually
    const [isLoading, setIsLoading] = useState(false); // Holds the loading variable and sets it with setIsLoading
    const serverURL = `https://game-tips-llm-server.onrender.com`; //"http://localhost:3050";
    let alreadyLoaded = false;
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

            const answerText = response.data.answer.response;

            // // Fight the LLM's random json formatting. There's probably a better way to do this.
            // let parsedAnswerText;
            // try {
            //
            //     const parsedResponse = JSON.parse(answerText);
            //     parsedAnswerText = parsedResponse; // Use the 'answer' part of the parsed object
            // } catch (error) {
            //     // If parsing fails, use the original 'answerText'
            //     console.error('Error parsing the answer text:', error);
            //     parsedAnswerText = answerText;
            // }

            // Add the LLMs answer to the conversation
            setConversation(conversation => [...conversation, { type: 'answer', text: answerText }]);
        } catch (error) {
            console.error('There was an error fetching the answer:', error);
            setConversation(conversation => [...conversation, { type: 'error', text: 'Failed to fetch answer. Please try again.' }]);
        } finally {
            setIsLoading(false);
            setQuestion('');
        }
    };
    const handleReset = async (event) => {
        event.preventDefault();
        setConversation(conversation => []);
        const response = await axios.get(`${serverURL}/resetconversation`, {});
    }
    const getChatMessageHistory = async() =>{
        alreadyLoaded = true;
        try {
            const response = await axios.get(`${serverURL}/gethistory`, {params: {}});
            const historyArray = response.data.history;
            historyArray.forEach((message) => {
                // Check if the message is from a human or AI
                if (message.id.includes("HumanMessage")) {
                    console.log("Human Message: ", message.kwargs.content);
                    setConversation(conversation => [...conversation, { type: 'question', text: message.kwargs.content}]);
                } else if (message.id.includes("AIMessage")) {
                    console.log("AI Message: ", message.kwargs.response);
                    setConversation(conversation => [...conversation, { type: 'answer', text: message.kwargs.response}]);
                } else {
                    console.log("Unknown Message Type: ", message);
                }
            });
        }
        catch (error)
        {
            console.error('There was an error fetching the history:', error);
        }

    }
    useEffect(() => {
        if(!alreadyLoaded) {
            getChatMessageHistory()
        }
    },[]);

//visuals and disable the button if there's no text or an active fetch is happening. There's also a reset button to reset the conversation.
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
                <button type="reset" disabled={isLoading} onClick={handleReset}>Reset</button>
            </form>
        </div>
    );
}

export default App;
