from flask import request, jsonify
from config import app, db
from models import stickerData, committeeData, photoData

@app.route("/stickerData", methods=["GET"])
def get_stickerData():
    stickerData = stickerData.query.all()
    json_stickerData = list(map(lambda x: x.to_json_stickerData(), stickerData))
    return jsonify({"stickerData": json_stickerData})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
