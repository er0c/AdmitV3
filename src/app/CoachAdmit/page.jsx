"use client"
/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import { useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onSnapshot, query, collection, orderBy, addDoc } from 'firebase/firestore'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import '../css/coach-admit.css';
import GlobalContext from '../GlobalContext';
import ReactMarkdown from 'react-markdown';
import HeaderApp from '../components/header/HeaderApp';
import FooterApp from '../components/footer/FooterApp';
import { addGoalToFirestore } from '../components/body/NewGoal';

function CoachAdmit(){
    const {
      completedApplications,
      totalScholarshipAmount
    } = useContext(GlobalContext);
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState('');
    const textareaRef = useRef(null); // Reference to the textarea element
    const chatContainerRef = useRef(null);
    const [isTyping] = useState(false);
    const [user] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
      // Ensure user is not null before accessing its properties
      if (user) {
        const unsubscribe = onSnapshot(query(collection(db, "users", user.email, 'chats'), orderBy('timestamp')), (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data());
          setChat(messages);
        });
    
        return () => unsubscribe();
      }
    }, [user]);

    useEffect(() => {
      // Scroll to the bottom of the chat container
      chatContainerRef.current?.scrollIntoView();
    }, [chat]);

    useEffect(() => {
      if (!user) {
        router.push('/');
      }
    }, [user]);

    if (chat.length === 0) {
      setChat([
        {
        role: 'chatbot',
        content: (
          <>
            Hello! 👋 I&apos;m <strong className="bold-text">Coach Admit</strong>, your knowledgeable and friendly guide on the exciting journey to higher education. Whether you&apos;re navigating the application process, seeking advice on majors, or wondering about scholarships, I&apos;m here to provide you with accurate and reliable answers.
            <br /><br />
            Ask me anything about college admissions, and I&apos;ll help you make informed decisions, every step of the way. Your success matters to me, so feel free to explore and ask any questions you have. Let&apos;s turn your dreams into admissions reality!
            <br /><br />
            How can I assist you today?
          </>
        ),
        }
      ]);
    }

    const CustomRenderer = ({ children, href }) => {
      if (href) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      return children;
    };

    const formatMessageContent = (content) => {
      if (typeof content !== 'string') {
        // If content is not a string, return it as is
        return content;
      }
      
      return <ReactMarkdown className='custom-markdown' components={{ a: CustomRenderer }}>{content}</ReactMarkdown>;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent line break
        if (userInput.trim() !== '') {
          handleSubmit();
        }
      }
    };

    const handleSubmit = async () => {
      if (chat.length === 1 && chat[0].role === 'chatbot') {
        setChat([]);
      }

      const userMessage = { role: 'user', content: userInput, timestamp: new Date() };
      setChat(prevChat => [...prevChat, userMessage]);
      setUserInput('');
    
      setChat(prevChat => [...prevChat, { role: 'chatbot', content: '...', timestamp: new Date() }]);
    
      try {
        const user = auth.currentUser; // Get the current user
        if (!user) {
          console.error("User is not authenticated.");
          return false; // Indicate failure
        }

        const response = await fetch("/api/chatgpt", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput,
          }),
        });
    
        const responseData = await response.json();
    
        console.log(responseData);
        if (responseData.choices && responseData.choices.length > 0) {
          const choice = responseData.choices[0];
    
          if (choice.finish_reason === 'function_call' && choice.message.function_call.name === 'createGoal') {
            const { goalName, dueDate } = JSON.parse(choice.message.function_call.arguments);

            const parsedDueDate = new Date(dueDate);
            const yearProvided = isNaN(parsedDueDate.getFullYear());

            // If year not provided, use current year as default
            const defaultYear = new Date().getFullYear();
            const formattedDueDate = yearProvided ? dueDate : `${dueDate}, ${defaultYear}`;
    
            const newGoal = {
              goalName,
              date: formattedDueDate,
              description: "", 
              tag: "",
              scholarshipAmount: "",
              completed: false,
            };
    
            await addGoalToFirestore(newGoal);

            const chatbotMessage = { role: 'chatbot', content: `All set! I've added “${goalName}” to your goal list, and it is due by ${formattedDueDate}.`, timestamp: new Date() };
            setChat(prevChat => [
              ...prevChat.filter(message => message.content !== '...'), // Remove the typing indicator
              chatbotMessage
            ]);
            await addDoc(collection(db, "users", user.email, 'chats'), chatbotMessage);
          } else {
            // Handle other types of responses
            const chatbotMessage = { role: 'chatbot', content: choice.message.content, timestamp: new Date() };
            setChat(prevChat => [
              ...prevChat.filter(message => message.content !== '...'), // Remove the typing indicator
              chatbotMessage
            ]);
            await addDoc(collection(db, "users", user.email, 'chats'), chatbotMessage);
          }
        }
        await addDoc(collection(db, "users", user.email, 'chats'), userMessage);
      } catch (error) {
        setChat(prevChat => prevChat.filter(message => message.content !== '...')); // Remove the typing indicator
        console.error('Error communicating with ChatGPT API:', error.message);
      }
    };
    
    
    return(
      <div>
        <HeaderApp completedApplications={completedApplications} totalScholarshipAmount={totalScholarshipAmount} />
        <div className='coach-logo-button'>
            <p>
                Coach Admit
            </p>
            <img src='/coachai.png' alt='coach admit'/>
        </div>
        <div className='chat-body'>
            <div className="messages">
                {chat.map((message, index) => (
                    <div key={index} className="message">
                        {message.role === 'chatbot' ? (
                          <>
                            <div className='bot-message-container'>
                              <img src ='/space.png' alt='Coach Admit' />
                              <div className="bot-message">
                                {formatMessageContent(message.content)}
                              </div>
                            </div>
                            {isTyping && (
                              <div className='bot-message-container'>
                                <img src ='/space.png' alt='Coach Admit' />
                                <div className="bot-message">
                                  ...
                                </div>
                              </div>
                            )}
                          </>
                            ) : (
                            <div className='user-message-container'>
                              <div className="user-message">{message.content}</div>
                              <img src={user.photoURL} alt='user' />
                            </div>
                            )}
                    </div>
                ))}
             </div>
             <div ref={chatContainerRef} />
        </div>
        <div className='chatbox'>
            <textarea
                ref={textareaRef}
                type='text'
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder='Ask anything...'
                onKeyDown={handleKeyDown}
            />
            <img src='/chatsend.png' 
            alt='send chat' 
            className={`send-icon ${!userInput && 'disabled'}`} 
            onClick={userInput ? handleSubmit : undefined}
            />
        </div>
        <FooterApp />
      </div>
    );
}

export default CoachAdmit;