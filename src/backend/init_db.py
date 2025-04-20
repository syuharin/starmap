import os
from dotenv import load_dotenv
from database import engine, SessionLocal, is_postgres
from models import Base, Star, Constellation, ConstellationLine
import models

# .envファイルから環境変数を読み込む
load_dotenv()

def add_orion_constellation(db):
    """オリオン座のデータを追加"""
    orion = Constellation(
        name="Orion",
        name_jp="オリオン座",
        abbreviation="Ori",
        season="冬",
        right_ascension_center=83.83,  # 中心赤経
        declination_center=2.78,       # 中心赤緯
        description="ギリシャ神話の狩人オリオンを表す星座。冬の夜空で最も目立つ星座の1つ。"
    )
    return orion

def add_big_dipper(db):
    """北斗七星（大熊座の一部）のデータを追加"""
    big_dipper = Constellation(
        name="Big Dipper",
        name_jp="北斗七星",
        abbreviation="UMa",
        season="春",
        right_ascension_center=183.5,  # 中心赤経
        declination_center=56.0,       # 中心赤緯
        description="大熊座の一部を構成する7つの明るい星のアスタリズム。古くから方角を知るための目印として使われてきた。"
    )
    db.add(big_dipper)
    db.flush()

    # 北斗七星の主要な星を追加
    stars = {
        "dubhe": Star(
            name="Dubhe",
            common_name_jp="ドゥベー",
            bayer_designation="α UMa",
            hip_number=54061,
            right_ascension=165.932,
            declination=61.751,
            magnitude=1.79,
            constellation_id=big_dipper.id
        ),
        "merak": Star(
            name="Merak",
            common_name_jp="メラク",
            bayer_designation="β UMa",
            hip_number=53910,
            right_ascension=165.460,
            declination=56.382,
            magnitude=2.37,
            constellation_id=big_dipper.id
        ),
        "phecda": Star(
            name="Phecda",
            common_name_jp="フェクダ",
            bayer_designation="γ UMa",
            hip_number=58001,
            right_ascension=178.457,
            declination=53.694,
            magnitude=2.44,
            constellation_id=big_dipper.id
        ),
        "megrez": Star(
            name="Megrez",
            common_name_jp="メグレズ",
            bayer_designation="δ UMa",
            hip_number=59774,
            right_ascension=183.856,
            declination=57.032,
            magnitude=3.31,
            constellation_id=big_dipper.id
        ),
        "alioth": Star(
            name="Alioth",
            common_name_jp="アリオト",
            bayer_designation="ε UMa",
            hip_number=62956,
            right_ascension=193.507,
            declination=55.959,
            magnitude=1.77,
            constellation_id=big_dipper.id
        ),
        "mizar": Star(
            name="Mizar",
            common_name_jp="ミザール",
            bayer_designation="ζ UMa",
            hip_number=65378,
            right_ascension=200.981,
            declination=54.925,
            magnitude=2.27,
            constellation_id=big_dipper.id
        ),
        "alkaid": Star(
            name="Alkaid",
            common_name_jp="アルカイド",
            bayer_designation="η UMa",
            hip_number=67301,
            right_ascension=206.885,
            declination=49.313,
            magnitude=1.86,
            constellation_id=big_dipper.id
        )
    }
    
    for star in stars.values():
        db.add(star)
    db.flush()

    # 北斗七星の星座線を追加（柄杓の形を形成）
    constellation_lines = [
        # 柄杓の外枠
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["dubhe"].id, star2_id=stars["merak"].id),
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["merak"].id, star2_id=stars["phecda"].id),
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["phecda"].id, star2_id=stars["megrez"].id),
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["megrez"].id, star2_id=stars["alioth"].id),
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["alioth"].id, star2_id=stars["mizar"].id),
        ConstellationLine(constellation_id=big_dipper.id, star1_id=stars["mizar"].id, star2_id=stars["alkaid"].id),
    ]
    
    db.add_all(constellation_lines)
    return big_dipper

def init_database():
    """データベースの初期化とテーブルの作成"""
    print("データベースを初期化しています...")
    Base.metadata.create_all(bind=engine)
    
    # セッションの作成
    db = SessionLocal()
    
    try:
        # オリオン座のデータを追加
        orion = add_orion_constellation(db)
        db.add(orion)
        db.flush()  # IDを取得するためにflush
        
        # 北斗七星のデータを追加
        big_dipper = add_big_dipper(db)
        
        # オリオン座の主要な星を追加
        betelgeuse = Star(
            name="Betelgeuse",
            right_ascension=88.7929,
            declination=7.4070,
            magnitude=0.42,
            constellation_id=orion.id
        )
        
        rigel = Star(
            name="Rigel",
            right_ascension=78.6345,
            declination=-8.2016,
            magnitude=0.18,
            constellation_id=orion.id
        )
        
        bellatrix = Star(
            name="Bellatrix",
            right_ascension=81.2828,
            declination=6.3497,
            magnitude=1.64,
            constellation_id=orion.id
        )
        
        saiph = Star(
            name="Saiph",
            right_ascension=86.9391,
            declination=-9.6697,
            magnitude=2.07,
            constellation_id=orion.id
        )
        
        alnitak = Star(
            name="Alnitak",
            right_ascension=85.1897,
            declination=-1.9425,
            magnitude=1.77,
            constellation_id=orion.id
        )
        
        alnilam = Star(
            name="Alnilam",
            right_ascension=84.0534,
            declination=-1.2019,
            magnitude=1.69,
            constellation_id=orion.id
        )
        
        mintaka = Star(
            name="Mintaka",
            right_ascension=83.0016,
            declination=-0.2991,
            magnitude=2.23,
            constellation_id=orion.id
        )
        
        # 星をデータベースに追加
        stars = [betelgeuse, rigel, bellatrix, saiph, alnitak, alnilam, mintaka]
        db.add_all(stars)
        db.flush()
        
        # オリオン座の星座線を追加
        constellation_lines = [
            # オリオンの肩と腰を結ぶ
            ConstellationLine(constellation_id=orion.id, star1_id=betelgeuse.id, star2_id=bellatrix.id),
            ConstellationLine(constellation_id=orion.id, star1_id=rigel.id, star2_id=saiph.id),
            
            # オリオンの帯（三ツ星）
            ConstellationLine(constellation_id=orion.id, star1_id=alnitak.id, star2_id=alnilam.id),
            ConstellationLine(constellation_id=orion.id, star1_id=alnilam.id, star2_id=mintaka.id),
            
            # 肩から帯へ
            ConstellationLine(constellation_id=orion.id, star1_id=betelgeuse.id, star2_id=alnitak.id),
            ConstellationLine(constellation_id=orion.id, star1_id=bellatrix.id, star2_id=mintaka.id),
            
            # 帯から腰へ
            ConstellationLine(constellation_id=orion.id, star1_id=alnitak.id, star2_id=saiph.id),
            ConstellationLine(constellation_id=orion.id, star1_id=mintaka.id, star2_id=rigel.id),
        ]
        db.add_all(constellation_lines)
        
        # コミット
        db.commit()
        print("初期データの追加が完了しました。")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("データベースの初期化が完了しました。")

if __name__ == "__main__":
    init_database()
