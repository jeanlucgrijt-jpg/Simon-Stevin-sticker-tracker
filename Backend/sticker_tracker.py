from flask import request, jsonify
from config import app, db
from models import stickerData, committeeData, photoData


#--------------------------      GET functions      -------------------------

@app.route("/stickerData", methods=["GET"])
def get_stickerData():
    Data = stickerData.query.all()
    json_stickerData = list(map(lambda x: x.to_json_stickerData(), Data))
    return jsonify({"stickerData": json_stickerData})

@app.route("/committeeData", methods=["GET"])
def get_committeeData():
    Data = committeeData.query.all()
    json_committeeData = list(map(lambda x: x.to_json_committeeData(), Data))
    return jsonify({"committeeData": json_committeeData})

@app.route("/photoData", methods=["GET"])
def get_photoData():
    Data = photoData.query.all()
    json_photoData = list(map(lambda x: x.to_json_photoData(), Data))
    return jsonify({"photoData": json_photoData})

#--------------------------      GET functions      -------------------------



#--------------------------      POST functions      -------------------------

@app.route("/upload_sticker", methods=["POST"])
def upload_sticker():
    data = request.get_json()

    print(data)

    user_id = data.get("user_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    date_picture = data.get("date_picture")
    sticker_id = data.get("sticker_id")
    title = data.get("title")
    description = data.get("description")

    if not latitude or not longitude or not sticker_id:
        return (jsonify({"message": "You must include a location and a sticker type"}), 
        400,
        )
    new_sticker = stickerData(
        user_id=user_id, 
        latitude=latitude, 
        longitude=longitude, 
        date_picture=date_picture, 
        sticker_id=sticker_id,
        title=title, 
        description=description
    )
    try:
        db.session.add(new_sticker)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "sticker added!"}), 201

#--------------------------      POST functions      -------------------------



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5001, debug=True)
