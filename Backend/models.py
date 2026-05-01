from config import db

class stickerData(db.Model):
    photo_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    latitude = db.Column(db.Numeric(9,6), unique=False, nullable=False)
    longitude = db.Column(db.Numeric(9,6), unique=False, nullable=False)
    date_picture = db.Column(db.Date, unique=False, nullable=True)
    date_uploaded = db.Column(db.DateTime, unique=False, nullable=False)
    sticker_id = db.Column(db.String(50), unique=False, nullable=False)
    title = db.Column(db.String(50), unique=False, nullable=True)
    description = db.Column(db.Text, unique=False, nullable=True)

    def to_json_stickerData(self):
        return{
            "photoId": self.photo_id,
            "userId": self.user_id,
            "latitude": self.latitude,
            "longtidue": self.longitude,
            "datePicture": self.date_picture,
            "dateUploaded": self.date_uploaded,
            "stickerId": self.sticker_id,
            "title": self.title,
            "description": self.description,
        }
    
class committeeData(db.Model):
    sticker_id = db.Column(db.String(50), db.ForeignKey('sticker_data.sticker_id'), primary_key=True)
    sticker_name = db.Column(db.String(50), unique=False, nullable=False)
    sticker_description = db.Column(db.String(50), unique=False, nullable=True)
    sticker_date = db.Column(db.Date, unique=False, nullable=True)
    committee_members = db.Column(db.Text, unique=False, nullable=False)
    committe_leus = db.Column(db.String(50), unique=False, nullable=False)
    committee_rubric = db.Column(db.Text, unique=False, nullable=True)
    lustrum = db.Column(db.Boolean, unique=False, nullable=False)

    def to_json_committeeData(self):
        return{
            "stickerId": self.sticker_id,
            "stickerName": self.sticker_name,
            "stickerDescription": self.sticker_description,
            "stickerDate": self.sticker_date,
            "committeeMembers": self.committee_members,
            "committeeLeus": self.committe_leus,
            "committeeRubric": self.committee_rubric,
            "lustrum": self.lustrum,
        }
    
class photoData(db.Model):
    photo_id = db.Column(db.Integer, db.ForeignKey('sticker_data.photo_id'), primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)
    
    def to_json_photoData(self):
        return{
            "photoId": self.photo_id,
            "imagePath": self.image_path,
        }