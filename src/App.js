import './App.css';
import Login from './components/auth/login';
import Home from './components/home';
import { AuthProvider } from './contexts/authContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
   <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login/>}/>
        <Route path='/home' element={<Home/>}/>
      </Routes>
    </BrowserRouter>
   </AuthProvider>
  );
}

export default App;
