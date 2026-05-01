import { ToastContainer } from "react-toastify";
import MainRouter from "./MainRouter.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <div className="app">
      <MainRouter />

      <ToastContainer
        position="top-left"
        autoClose={1500}
        newestOnTop
        closeOnClick
        draggable
      />
    </div>
  );
}

export default App;