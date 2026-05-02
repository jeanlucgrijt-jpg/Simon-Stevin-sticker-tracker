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
    user_id = 
    latitude = 
    longitude = 
    date_picture = 
    date_uploaded = 
    sticker_id = 
    title = 
    description =
    image_path =

#--------------------------      POST functions      -------------------------



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
