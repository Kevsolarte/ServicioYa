import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/appRouter'
import './App.css'

function App() {

  return (
    <>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
    
    </>
  )
}

export default App
