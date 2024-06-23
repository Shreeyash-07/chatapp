import { useState } from "react";
import { doCreateUserWithEmailAndPassword, doSignInWithEmailAndPassword } from "../../../firebase/auth";


const Login = () =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (email !== "" && password !== ""){
            doCreateUserWithEmailAndPassword(email,password);
        }
    }
    return (
        <div>
            <form onSubmit={handleLogin}>
                <input type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}/>
                <input type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit"/>
            </form>
        </div>
    )
}

export default Login;