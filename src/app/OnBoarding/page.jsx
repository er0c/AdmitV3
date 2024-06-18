"use client";

import React, { userState} from 'react';
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 

const Page = () => {
    // Variables needed for the sign up form 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // Function to handle the sign up form
    const handleSignUp = async () => {
        try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Create the user
        const user = userCredential.user; // Get the user 
        await setDoc(doc(db, "users", user.uid), { // Add the user to the database
            email: user.email,
        });
        } catch (error) { 
        setError(error.message);
        }
    };
    
    return (
        <div>
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignUp}>Sign Up</button>
        {error && <p>{error}</p>}
        </div>
    );
    }