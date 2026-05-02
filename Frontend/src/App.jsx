import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [stickerData, setStickers] = useState([])

  useEffect(() => {
    fetchStickers()
  }, [])

  const fetchStickers = async () => {
    const response = await fetch("http://127.0.0.1:5000/stickerData")
    const data = await response.json()
    setStickers(data.stickerData)
    console.log(data.stickerData)
  }

  return (
    <>
     
    </>
  )
}

export default App
