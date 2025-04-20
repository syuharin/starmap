import os
import csv
from dotenv import load_dotenv
from sqlalchemy import text
from database import engine, SessionLocal
from models import Base, Star, Constellation, ConstellationLine

# .envファイルから環境変数を読み込む
load_dotenv()

# CSVファイルが配置されているディレクトリ
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
CONSTELLATIONS_CSV = os.path.join(DATA_DIR, 'constellations.csv')
STARS_CSV = os.path.join(DATA_DIR, 'stars.csv')
CONSTELLATION_LINES_CSV = os.path.join(DATA_DIR, 'constellation_lines.csv')

def clear_database(db):
    """データベースの全テーブルのデータを削除する"""
    print("既存のデータをクリアしています...")
    # 外部キー制約を一時的に無効化 (SQLiteとPostgreSQLで構文が異なる場合がある)
    # ここでは単純に削除を試みる。依存関係によってはエラーになる可能性があるため、
    # 削除順序を考慮するか、制約を無効化/有効化する処理が必要になる場合がある。
    # まず依存関係の少ないテーブルから削除
    db.execute(text(f'DELETE FROM {ConstellationLine.__tablename__}'))
    db.execute(text(f'DELETE FROM {Star.__tablename__}'))
    db.execute(text(f'DELETE FROM {Constellation.__tablename__}'))
    db.commit()
    print("データのクリアが完了しました。")

def init_database():
    """データベースの初期化、テーブル作成、CSVからのデータ投入"""
    print("データベースを初期化しています...")
    # テーブルが存在しない場合は作成
    Base.metadata.create_all(bind=engine)

    # セッションの作成
    db = SessionLocal()

    try:
        # 1. 既存データをクリア
        clear_database(db)

        # 2. 星座データをCSVから読み込み、DBに追加
        print(f"{CONSTELLATIONS_CSV} から星座データを読み込んでいます...")
        constellation_map = {} # abbreviation -> id のマッピング用
        with open(CONSTELLATIONS_CSV, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                constellation = Constellation(
                    name=row['name'],
                    name_jp=row['name_jp'],
                    abbreviation=row['abbreviation'],
                    season=row['season'],
                    right_ascension_center=float(row['right_ascension_center']),
                    declination_center=float(row['declination_center']),
                    description=row['description']
                )
                db.add(constellation)
                db.flush() # IDを取得するため
                constellation_map[constellation.abbreviation] = constellation.id
        db.commit() # 星座データをコミット
        print("星座データの追加が完了しました。")

        # 3. 星データをCSVから読み込み、DBに追加
        print(f"{STARS_CSV} から星データを読み込んでいます...")
        star_map = {} # hip_number -> id のマッピング用
        with open(STARS_CSV, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                constellation_id = constellation_map.get(row['constellation_abbreviation'])
                if constellation_id is None:
                    print(f"警告: 星 '{row['name']}' の星座略符 '{row['constellation_abbreviation']}' が見つかりません。スキップします。")
                    continue

                # hip_number が空文字列やNoneでないことを確認
                hip_number_str = row.get('hip_number')
                if not hip_number_str:
                    print(f"警告: 星 '{row['name']}' の hip_number が無効です。スキップします。")
                    continue
                try:
                    hip_number = int(hip_number_str)
                except ValueError:
                    print(f"警告: 星 '{row['name']}' の hip_number '{hip_number_str}' が整数に変換できません。スキップします。")
                    continue

                star = Star(
                    hip_number=hip_number,
                    name=row['name'],
                    common_name_jp=row.get('common_name_jp'), # Optional
                    bayer_designation=row.get('bayer_designation'), # Optional
                    right_ascension=float(row['right_ascension']),
                    declination=float(row['declination']),
                    magnitude=float(row['magnitude']),
                    constellation_id=constellation_id
                )
                db.add(star)
                db.flush() # IDを取得するため
                star_map[star.hip_number] = star.id
        db.commit() # 星データをコミット
        print("星データの追加が完了しました。")

        # 4. 星座線データをCSVから読み込み、DBに追加
        print(f"{CONSTELLATION_LINES_CSV} から星座線データを読み込んでいます...")
        with open(CONSTELLATION_LINES_CSV, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            lines_to_add = []
            for row in reader:
                constellation_id = constellation_map.get(row['constellation_abbreviation'])
                star1_id = star_map.get(int(row['star1_hip']))
                star2_id = star_map.get(int(row['star2_hip']))

                if constellation_id is None:
                    print(f"警告: 星座線データの星座略符 '{row['constellation_abbreviation']}' が見つかりません。スキップします。")
                    continue
                if star1_id is None:
                    print(f"警告: 星座線データの星1 HIP '{row['star1_hip']}' が見つかりません。スキップします。")
                    continue
                if star2_id is None:
                    print(f"警告: 星座線データの星2 HIP '{row['star2_hip']}' が見つかりません。スキップします。")
                    continue

                line = ConstellationLine(
                    constellation_id=constellation_id,
                    star1_id=star1_id,
                    star2_id=star2_id
                )
                lines_to_add.append(line)
            db.add_all(lines_to_add)
        db.commit() # 星座線データをコミット
        print("星座線データの追加が完了しました。")

        print("データベースの初期化とデータ投入が正常に完了しました。")

    except Exception as e:
        print(f"エラーが発生しました: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
