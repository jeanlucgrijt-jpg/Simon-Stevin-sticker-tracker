import React from "react"

const StickerList = ({stickers}) => {
    return <div>
        <h2>Stickers</h2>
        <table>
            <thead>
                <tr>
                    <th>User id</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Picture date</th>
                    <th>Sticker type</th>
                    <th>Title</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {stickers.map((sticker) => (
                    <tr key={sticker.photo_id}>
                        <td>{sticker.user_id}</td>
                        <td>{sticker.latitude}</td>
                        <td>{sticker.longitude}</td>
                        <td>{sticker.date_picture}</td>
                        <td>{sticker.date_uploaded}</td>
                        <td>{sticker.sticker_id}</td>
                        <td>{sticker.title}</td>
                        <td>{sticker.description}</td>
                        <td>
                            <button>Upload</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}
export default StickerList