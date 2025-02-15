from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
from sqlalchemy import or_
import skyfield.api as sf
from skyfield.api import load, wgs84
import numpy as np
from database import SessionLocal
from models import Constellation, Star

app = FastAPI(title="星図表示アプリケーション API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発環境用。本番環境では適切に制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skyfieldのエフェメリスデータをロード
ts = load.timescale()
eph = load('de421.bsp')

@app.get("/search")
async def search_celestial_objects(
    query: str = Query(..., description="検索キーワード"),
    type: Optional[str] = Query(None, description="検索対象（star/constellation/all）")
):
    """
    星や星座を検索するエンドポイント
    """
    try:
        db = SessionLocal()
        results = {
            "stars": [],
            "constellations": []
        }
        
        # 検索タイプに基づいて検索を実行
        if type in [None, "all", "star"]:
            # 星の検索
            stars = db.query(Star).filter(
                or_(
                    Star.name.ilike(f"%{query}%"),
                    Star.common_name_jp.ilike(f"%{query}%"),
                    Star.bayer_designation.ilike(f"%{query}%")
                )
            ).all()
            
            for star in stars:
                results["stars"].append({
                    "id": star.id,
                    "name": star.name,
                    "name_jp": star.common_name_jp,
                    "bayer_designation": star.bayer_designation,
                    "right_ascension": star.right_ascension,
                    "declination": star.declination,
                    "magnitude": star.magnitude,
                    "constellation_id": star.constellation_id
                })
        
        if type in [None, "all", "constellation"]:
            # 星座の検索
            constellations = db.query(Constellation).filter(
                or_(
                    Constellation.name.ilike(f"%{query}%"),
                    Constellation.name_jp.ilike(f"%{query}%"),
                    Constellation.abbreviation.ilike(f"%{query}%")
                )
            ).all()
            
            for constellation in constellations:
                results["constellations"].append({
                    "id": constellation.id,
                    "name": constellation.name,
                    "name_jp": constellation.name_jp,
                    "abbreviation": constellation.abbreviation,
                    "season": constellation.season,
                    "description": constellation.description,
                    "right_ascension_center": constellation.right_ascension_center,
                    "declination_center": constellation.declination_center
                })
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/")
async def read_root():
    return {"message": "星図表示アプリケーション API"}

@app.get("/stars")
async def get_stars(
    latitude: float,
    longitude: float,
    altitude: Optional[float] = 0,
    datetime_str: Optional[str] = None
):
    try:
        # 日時の処理
        if datetime_str:
            dt = datetime.fromisoformat(datetime_str)
        else:
            dt = datetime.now()
        
        t = ts.from_datetime(dt)
        
        # 観測地点の設定
        location = wgs84.latlon(latitude, longitude, altitude)
        
        # 基本的な天体を取得
        sun = eph['sun']
        earth = eph['earth']
        
        # 観測地点からの位置を計算
        observer = earth + location
        
        # 太陽の位置を計算
        sun_position = observer.at(t).observe(sun)
        alt, az, _ = sun_position.apparent().altaz()
        
        # ここで星のデータを計算して返す
        # 実際のアプリケーションでは、より詳細な星のカタログを使用する
        
        return {
            "observer": {
                "latitude": latitude,
                "longitude": longitude,
                "altitude": altitude,
                "datetime": dt.isoformat()
            },
            "sun_position": {
                "altitude": float(alt.degrees),
                "azimuth": float(az.degrees)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/constellations")
async def get_constellations():
    """
    星座データを返すエンドポイント
    実際のアプリケーションでは、完全な星座データを返す
    """
    try:
        db = SessionLocal()
        constellations = db.query(Constellation).all()
        
        result = {
            "constellations": []
        }
        
        for constellation in constellations:
            stars_data = []
            for star in constellation.stars:
                stars_data.append({
                    "name": star.name,
                    "ra": star.right_ascension,
                    "dec": star.declination,
                    "magnitude": star.magnitude
                })
            
            # 星座線のデータを取得
            lines_data = []
            for line in constellation.lines:
                star1 = db.query(Star).filter(Star.id == line.star1_id).first()
                star2 = db.query(Star).filter(Star.id == line.star2_id).first()
                if star1 and star2:
                    lines_data.append({
                        "star1": {
                            "name": star1.name,
                            "ra": star1.right_ascension,
                            "dec": star1.declination
                        },
                        "star2": {
                            "name": star2.name,
                            "ra": star2.right_ascension,
                            "dec": star2.declination
                        }
                    })
            
            result["constellations"].append({
                "name": constellation.name,
                "name_jp": constellation.name_jp,
                "description": constellation.description,
                "right_ascension_center": constellation.right_ascension_center,
                "declination_center": constellation.declination_center,
                "stars": stars_data,
                "lines": lines_data
            })
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
