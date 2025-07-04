import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import { ToastContainer } from "react-toastify";
import AppRoutes from './routes/AppRoutes'

function App() {

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppRoutes />
    </Router>
  )
}

export default App
