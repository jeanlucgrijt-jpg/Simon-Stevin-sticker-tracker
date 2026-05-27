import { useState, useEffect } from 'react'
import StickerList from './StickersList'
import StickerForm from './StickerForm'
import StickerTracker from './StickerMap'
import './App.css'

function App() {
  const [stickers, setStickers] = useState([])

  useEffect(() => {
    fetchStickers()
  }, []);

  const fetchStickers = async () => {
    const response = await fetch("http://127.0.0.1:5000/stickerData");
    const data = await response.json();
    setStickers(data.stickerData);
    console.log(data.stickerData);
  };

  return ( 
    <>
      {/* <StickerList stickers={stickers} />
      <StickerForm /> */}
      <StickerTracker/>
    </>
  );
}

export default App;