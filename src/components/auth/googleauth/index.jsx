import { useEffect } from "react";
import { doHandleRedirectResult, doSignInWithGoogle } from "../../../firebase/auth"
import { FcGoogle } from "react-icons/fc";
import "./index.css"
import { Navigate } from "react-router-dom";


const SignInWithGoogleButton = () => {
    const handleSignIn = () => {
        doSignInWithGoogle().catch(err=>{
            return (<Navigate to={'/'} replace={true}/>) 
        });
    }

    useEffect(()=>{
        doHandleRedirectResult();
    },[]);

    return(
        <div onClick={handleSignIn}>
            <div className="g_login_inner">
                <div className="g_logo">
                <FcGoogle/>
                </div>
                <div className="g_text">
                    Sign In with Google
                </div>
            </div>
        </div>
    )
}

export default SignInWithGoogleButton;