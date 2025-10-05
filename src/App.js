import Login from './components/Login';
import Home from './components/HomePage';
import Register from './components/Login/Register';
import './App.css';
import { BrowserRouter , Routes, Route} from "react-router-dom";


function App() {
  return (
    <>
    <BrowserRouter>
     <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/' element={<Home/>}/>
     </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;


