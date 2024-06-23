import { auth } from "./firebase";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { createUser } from "./service";

export const doCreateUserWithEmailAndPassword = async(email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSignInWithGoogle = async() => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithRedirect(auth, provider);
    return result;
}

export const doHandleRedirectResult = async() => {
    try {
        const result = await getRedirectResult(auth);
        if(result){
            const user = result.user;
            await createUser(user, user.displayName, user.photoURL)
        }
    } catch (err) {
        console.error({err})
    }
}
export const doSignOut = () => {
    return auth.signOut();
}