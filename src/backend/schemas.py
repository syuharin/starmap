from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# スター関連のスキーマ
class StarBase(BaseModel):
    name: str
    right_ascension: float = Field(..., description="赤経")
    declination: float = Field(..., description="赤緯")
    magnitude: float = Field(..., description="等級")

class StarCreate(StarBase):
    constellation_id: int

class Star(StarBase):
    id: int
    constellation_id: int

    class Config:
        orm_mode = True

# 星座関連のスキーマ
class ConstellationBase(BaseModel):
    name: str
    name_jp: str
    description: Optional[str] = None

class ConstellationCreate(ConstellationBase):
    pass

class Constellation(ConstellationBase):
    id: int
    stars: List[Star] = []

    class Config:
        orm_mode = True

# 星座ライン関連のスキーマ
class ConstellationLineBase(BaseModel):
    constellation_id: int
    star1_id: int
    star2_id: int

class ConstellationLineCreate(ConstellationLineBase):
    pass

class ConstellationLine(ConstellationLineBase):
    id: int

    class Config:
        orm_mode = True

# ユーザー設定関連のスキーマ
class UserSettingBase(BaseModel):
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    dark_mode: int = Field(0, ge=0, le=1)

class UserSettingCreate(UserSettingBase):
    pass

class UserSetting(UserSettingBase):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True

# 観測位置関連のスキーマ
class ObserverLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="緯度")
    longitude: float = Field(..., ge=-180, le=180, description="経度")
    altitude: Optional[float] = Field(0, description="高度（メートル）")
    datetime: Optional[datetime] = None

# 天体位置関連のスキーマ
class CelestialPosition(BaseModel):
    altitude: float = Field(..., description="高度（度）")
    azimuth: float = Field(..., description="方位角（度）")

# API応答用のスキーマ
class StarMapResponse(BaseModel):
    observer: ObserverLocation
    sun_position: CelestialPosition
    stars: Optional[List[Star]] = None
    constellations: Optional[List[Constellation]] = None
