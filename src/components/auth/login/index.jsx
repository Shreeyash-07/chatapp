import { useState } from "react";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../../../firebase/auth";
import { useAuth } from "../../../contexts/authContext";
import { Navigate } from "react-router-dom";
import { testDB } from "../../../firebase/service";
import SignInWithGoogleButton from "../googleauth";
import "./index.css";
const Login = () =>{
const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (email !== "" && password !== ""){
            doSignInWithEmailAndPassword(email,password);
        }
    }

    const handledb = () => {
        testDB()
    }
    return (
        <div className="login_container">
            {userLoggedIn && (<Navigate to={'/home'} replace={true}/>)}
            {/* <div>
            <form onSubmit={handleLogin}>
                <input type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}/>
                <input type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>
            </div> */}
            <div className="login_title">Sign In</div>
            <div className="g_login">
                <SignInWithGoogleButton/>
            </div>
            
            {/* <button onClick={handledb}>Continue with Google</button> */}

        </div>
    )
}

export default Login;