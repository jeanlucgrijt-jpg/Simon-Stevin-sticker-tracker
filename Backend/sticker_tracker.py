from flask import request, jsonify, send_from_directory
from config import app, db
from models import stickerData, committeeData, photoData
from PIL import Image
from pillow_heif import register_heif_opener
from datetime import date
import os
import re

register_heif_opener()

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpeg", ".jpg", ".heif", ".heic"}
ALLOWED_IMAGE_FORMATS = {"PNG", "JPEG", "HEIF"}
STICKER_IMAGE_FOLDER = os.path.abspath(
    os.path.join(app.root_path, "..", "pictures_site", "stickers")
)


def normalize_picture_date(value):
    if value in (None, ""):
        return None

    if not isinstance(value, str):
        raise ValueError("date_picture must use the YYYY-MM-DD format")

    match = re.fullmatch(
        r"(\d{4}-\d{2}-\d{2})(?:T.*)?",
        value
    )

    if not match:
        raise ValueError("date_picture must use the YYYY-MM-DD format")

    try:
        return date.fromisoformat(match.group(1)).isoformat()
    except ValueError as exc:
        raise ValueError(
            "date_picture must use the YYYY-MM-DD format"
        ) from exc


# ==========================================================
# UNIQUE STICKER ROUTE
# ==========================================================

@app.route(
    "/stickers/<path:filename>"
)
def serve_sticker(filename):

    return send_from_directory(
        STICKER_IMAGE_FOLDER,
        filename
    )


# ==========================================================
# GET ROUTES
# ==========================================================

@app.route("/stickerData", methods=["GET"])
def get_stickerData():
    data = stickerData.query.all()
    json_data = list(map(lambda x: x.to_json_stickerData(), data))
    return jsonify({"stickerData": json_data})


@app.route("/committeeData", methods=["GET"])
def get_committeeData():
    data = committeeData.query.all()
    json_data = list(map(lambda x: x.to_json_committeeData(), data))
    return jsonify({"committeeData": json_data})


@app.route("/photoData", methods=["GET"])
def get_photoData():
    data = photoData.query.all()
    json_data = list(map(lambda x: x.to_json_photoData(), data))
    return jsonify({"photoData": json_data})

@app.route("/sticker/<int:photo_id>", methods=["GET"])
def get_single_sticker(photo_id):
    sticker = stickerData.query.get(photo_id)

    if not sticker:
        return jsonify({"message": "Sticker not found"}), 404

    return jsonify(sticker.to_json_stickerData())


@app.route("/committee/<string:sticker_id>", methods=["GET"])
def get_single_committee(sticker_id):
    committee = committeeData.query.get(sticker_id)

    if not committee:
        return jsonify({"message": "Committee not found"}), 404

    return jsonify(committee.to_json_committeeData())


@app.route("/photo/<int:photo_id>", methods=["GET"])
def get_single_photo(photo_id):
    photo = photoData.query.get(photo_id)

    if not photo:
        return jsonify({"message": "Photo not found"}), 404

    return jsonify(photo.to_json_photoData())


# ==========================================================
# POST ROUTES
# ==========================================================

@app.route("/upload_sticker", methods=["POST"])
def upload_sticker():
    data = request.get_json()

    user_id = data.get("user_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    try:
        date_picture = normalize_picture_date(data.get("date_picture"))
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    sticker_id = data.get("sticker_id")
    title = data.get("title")
    description = data.get("description")

    if not latitude or not longitude or not sticker_id:
        return jsonify({
            "message": "You must include a location and sticker type"
        }), 400

    new_sticker = stickerData(
        user_id=user_id,
        latitude=latitude,
        longitude=longitude,
        date_picture=date_picture,
        sticker_id=sticker_id,
        title=title,
        description=description,
    )

    try:
        db.session.add(new_sticker)
        db.session.commit()

        return jsonify({
            "message": "Sticker added!",
            "photo_id": new_sticker.photo_id,
        }), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 400


@app.route("/upload_committee", methods=["POST"])
def upload_committee():
    data = request.get_json()

    committee = committeeData(
        sticker_id=data.get("sticker_id"),
        sticker_name=data.get("sticker_name"),
        sticker_description=data.get("sticker_description"),
        sticker_date=data.get("sticker_date"),
        committee_members=data.get("committee_members"),
        committe_leus=data.get("committe_leus"),
        committee_rubric=data.get("committee_rubric"),
        lustrum=data.get("lustrum", False),
    )

    try:
        db.session.add(committee)
        db.session.commit()
        return jsonify({"message": "Committee added!"}), 201

    except Exception as e:
        return jsonify({"message": str(e)}), 400


@app.route("/upload_photo_file", methods=["POST"])
def upload_photo_file():

    photo_id = request.form.get("photo_id")

    uploaded_file = request.files.get("image")

    if not photo_id:
        return jsonify({
            "message": "Missing photo_id"
        }), 400

    if not uploaded_file:
        return jsonify({
            "message": "No image uploaded"
        }), 400

    extension = os.path.splitext(uploaded_file.filename or "")[1].lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({
            "message": (
                "Unsupported image type. Use PNG, JPEG, JPG, HEIF, or HEIC."
            )
        }), 400

    try:
        photo_id_number = int(photo_id)
        os.makedirs(STICKER_IMAGE_FOLDER, exist_ok=True)

        jpeg_filename = f"{photo_id_number}.JPEG"

        save_path = os.path.join(
            STICKER_IMAGE_FOLDER,
            jpeg_filename
        )

        with Image.open(uploaded_file) as image:
            image.load()

            if image.format not in ALLOWED_IMAGE_FORMATS:
                return jsonify({
                    "message": (
                        "Unsupported image type. "
                        "Use PNG, JPEG, JPG, HEIF, or HEIC."
                    )
                }), 400

            if image.mode != "RGB":
                image = image.convert("RGB")

            image.save(
                save_path,
                "JPEG",
                quality=95
            )

        existing_photo = photoData.query.get(
            photo_id_number
        )

        if existing_photo:

            existing_photo.image_path = (
                f"stickers/{jpeg_filename}"
            )

        else:

            photo = photoData(
                photo_id=photo_id_number,
                image_path=f"stickers/{jpeg_filename}"
            )

            db.session.add(photo)

        db.session.commit()

        return jsonify({
            "message": "Image uploaded",
            "image_path":
                f"stickers/{jpeg_filename}"
        }), 201

    except (OSError, ValueError) as error:
        return jsonify({
            "message": f"Invalid image upload: {error}"
        }), 400

    except Exception as e:
        return jsonify({
            "message": str(e)
        }), 500


# ==========================================================
# UPDATE ROUTES
# ==========================================================
@app.route("/update_sticker/<int:photo_id>", methods=["PUT"])
def update_sticker(photo_id):
    sticker = stickerData.query.get(photo_id)

    if not sticker:
        return jsonify({"message": "Sticker not found"}), 404

    data = request.get_json()

    sticker.latitude = data.get("latitude", sticker.latitude)
    sticker.longitude = data.get("longitude", sticker.longitude)
    try:
        sticker.date_picture = normalize_picture_date(
            data.get("date_picture", sticker.date_picture)
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    sticker.sticker_id = data.get("sticker_id", sticker.sticker_id)
    sticker.title = data.get("title", sticker.title)
    sticker.description = data.get("description", sticker.description)

    db.session.commit()

    return jsonify({"message": "Sticker updated"})


@app.route("/update_committee/<string:sticker_id>", methods=["PUT"])
def update_committee(sticker_id):
    committee = committeeData.query.get(sticker_id)

    if not committee:
        return jsonify({"message": "Committee not found"}), 404

    data = request.get_json()

    committee.sticker_name = data.get("sticker_name", committee.sticker_name)
    committee.sticker_description = data.get("sticker_description", committee.sticker_description)
    committee.sticker_date = data.get("sticker_date", committee.sticker_date)
    committee.committee_members = data.get("committee_members", committee.committee_members)
    committee.committe_leus = data.get("committe_leus", committee.committe_leus)
    committee.committee_rubric = data.get("committee_rubric", committee.committee_rubric)
    committee.lustrum = data.get("lustrum", committee.lustrum)

    db.session.commit()

    return jsonify({"message": "Committee updated"})


# ==========================================================
# DELETE ROUTES
# ==========================================================

@app.route("/delete_sticker/<int:photo_id>", methods=["DELETE"])
def delete_sticker(photo_id):
    sticker = stickerData.query.get(photo_id)

    if not sticker:
        return jsonify({"message": "Sticker not found"}), 404

    db.session.delete(sticker)
    db.session.commit()

    return jsonify({"message": "Sticker deleted"})


@app.route("/delete_committee/<string:sticker_id>", methods=["DELETE"])
def delete_committee(sticker_id):
    committee = committeeData.query.get(sticker_id)

    if not committee:
        return jsonify({"message": "Committee not found"}), 404

    db.session.delete(committee)
    db.session.commit()

    return jsonify({"message": "Committee deleted"})


@app.route("/delete_photo/<int:photo_id>", methods=["DELETE"])
def delete_photo(photo_id):
    photo = photoData.query.get(photo_id)

    if not photo:
        return jsonify({"message": "Photo not found"}), 404

    db.session.delete(photo)
    db.session.commit()

    return jsonify({"message": "Photo deleted"})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
