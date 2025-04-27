from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# 星のデータモデル
class Star(Base):
    __tablename__ = "stars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    common_name_jp = Column(String)  # 日本語の通称
    bayer_designation = Column(String)  # バイエル符号
    hip_number = Column(Integer)  # ヒッパルコス星表番号
    right_ascension = Column(Float)  # 赤経
    declination = Column(Float)  # 赤緯
    magnitude = Column(Float)  # 等級
    constellation_id = Column(Integer, ForeignKey("constellations.id"))

    constellation = relationship("Constellation", back_populates="stars")


# 星座モデル
class Constellation(Base):
    __tablename__ = "constellations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    name_jp = Column(String)  # 日本語名
    abbreviation = Column(String)  # 略符（例：UMa, Ori）
    season = Column(String)  # 見頃の季節
    right_ascension_center = Column(Float)  # 星座の中心赤経
    declination_center = Column(Float)  # 星座の中心赤緯
    description = Column(String)  # 説明・神話

    stars = relationship("Star", back_populates="constellation")
    lines = relationship("ConstellationLine", back_populates="constellation")


# 星座を構成する線のモデル
class ConstellationLine(Base):
    __tablename__ = "constellation_lines"

    id = Column(Integer, primary_key=True, index=True)
    constellation_id = Column(Integer, ForeignKey("constellations.id"))
    star1_id = Column(Integer, ForeignKey("stars.id"))
    star2_id = Column(Integer, ForeignKey("stars.id"))

    constellation = relationship("Constellation", back_populates="lines")


# ユーザー設定モデル
class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    last_latitude = Column(Float)  # 最後に使用した緯度
    last_longitude = Column(Float)  # 最後に使用した経度
    dark_mode = Column(Integer)  # ダークモード設定 (0: オフ, 1: オン)
    updated_at = Column(DateTime, default=datetime.utcnow)


# キャッシュデータモデル
class CacheData(Base):
    __tablename__ = "cache_data"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    data = Column(String)  # JSON形式でデータを保存
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
