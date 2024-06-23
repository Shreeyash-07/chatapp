import { useAuth } from "../../../contexts/authContext";
import { Navigate } from "react-router-dom";
import SignInWithGoogleButton from "../googleauth";
import "./index.css";
const Login = () =>{
const { userLoggedIn } = useAuth();
    return (
        <div className="login_container">
            {userLoggedIn && (<Navigate to={'/home'} replace={true}/>)}
            <div className="login_title">Sign In</div>
            <div className="g_login">
                <SignInWithGoogleButton/>
            </div>
        </div>
    )
}

export default Login;