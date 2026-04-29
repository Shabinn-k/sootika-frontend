import { ToastContainer } from 'react-toastify';
import './App.css'
import MainRouter from './MainRouter.jsx'
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
    <MainRouter/>
    <ToastContainer
        position="top-left"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        draggable/>
    </>
  )
}

export default App
