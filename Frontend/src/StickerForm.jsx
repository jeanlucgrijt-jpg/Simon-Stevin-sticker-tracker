import { useState } from "react";

const StickerForm = ({}) => {
    const [userId, setUserId] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [datePicture, setDatePicture] = useState("")
    const [stickerId, setStickerId] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const onSubmit= async (e) => {
        e.preventDefault()


        const data = {
            user_id: userId,
            latitude: (latitude),
            longitude: longitude,
            date_picture: datePicture,
            sticker_id: stickerId,
            title: title,
            description: description,
        };

        console.log(data)
        const url = "http://127.0.0.1:5000/upload_sticker"
        const options ={
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
            
        }
        const response = await fetch(url, options)
        if (response.status !==201 && response.status !== 200) {
            const data = await response.json()
            alert(data.message)
        } else {
            // successful
        }
    }

    return <form onSubmit={onSubmit}>
        <div>
            <label htmlFor="userId">User ID:</label>
            <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            />

            <label htmlFor="latitude">Latitude:</label>
            <input
            type="number"
            id="latitude"
            step="0.000001"
            name="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            />

            <label htmlFor="longitude">Longitude:</label>
            <input
            type="number"
            id="longitude"
            step="0.000001"
            name="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            />

            <label htmlFor="datePicture">Date Picture Taken:</label>
            <input
            type="date"
            id="datePicture"
            name="date_picture"
            value={datePicture}
            onChange={(e) => setDatePicture(e.target.value)}
            />

            <label htmlFor="stickerId">Sticker ID:</label>
            <input
            type="text"
            id="stickerId"
            name="sticker_id"
            maxLength="15"
            value={stickerId}
            onChange={(e) => setStickerId(e.target.value)}
            />

            <label htmlFor="title">Title:</label>
            <input
            type="text"
            id="title"
            name="title"
            maxLength="50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="description">Description:</label>
            <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            ></textarea>
        </div>
        <button type="submit">Add sticker</button>

    </form>
} 

export default StickerForm