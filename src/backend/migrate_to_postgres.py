#!/usr/bin/env python
"""
SQLiteからPostgreSQLへのデータ移行スクリプト
"""
import os
import sqlite3
import sys

# import psycopg2  # Unused
from dotenv import load_dotenv
from models import Base, Constellation, ConstellationLine, Star
from sqlalchemy import create_engine  # text is unused
from sqlalchemy.orm import sessionmaker

# .envファイルから環境変数を読み込む
load_dotenv()

# PostgreSQL接続URLを環境変数から取得
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or not DATABASE_URL.startswith("postgresql"):
    print("エラー: 有効なPostgreSQL接続URLが設定されていません。")
    print(
        "環境変数DATABASE_URLを設定してください。例: postgresql://user:password@localhost:5432/starmap"
    )
    sys.exit(1)

# SQLiteデータベースファイルのパス
SQLITE_DB_PATH = "starmap.db"


def create_postgres_tables():
    """PostgreSQLにテーブルを作成"""
    print("PostgreSQLにテーブルを作成しています...")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("テーブル作成完了")
    return engine


def migrate_data():
    """SQLiteからPostgreSQLにデータを移行"""
    print(f"SQLite ({SQLITE_DB_PATH}) からPostgreSQLにデータを移行しています...")

    # SQLite接続
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"エラー: SQLiteデータベースファイル {SQLITE_DB_PATH} が見つかりません。")
        sys.exit(1)

    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    # PostgreSQL接続
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    pg_session = Session()

    try:
        # 星座データの移行
        print("星座データを移行中...")
        sqlite_cursor.execute("SELECT * FROM constellations")
        constellations = sqlite_cursor.fetchall()

        constellation_id_map = {}  # SQLiteのIDとPostgreSQLのIDのマッピング

        for constellation in constellations:
            new_constellation = Constellation(
                name=constellation["name"],
                name_jp=constellation["name_jp"],
                abbreviation=constellation["abbreviation"],
                season=constellation["season"],
                right_ascension_center=constellation["right_ascension_center"],
                declination_center=constellation["declination_center"],
                description=constellation["description"],
            )
            pg_session.add(new_constellation)
            pg_session.flush()
            constellation_id_map[constellation["id"]] = new_constellation.id

        # 星データの移行
        print("星データを移行中...")
        sqlite_cursor.execute("SELECT * FROM stars")
        stars = sqlite_cursor.fetchall()

        star_id_map = {}  # SQLiteのIDとPostgreSQLのIDのマッピング

        for star in stars:
            new_star = Star(
                name=star["name"],
                common_name_jp=(
                    star["common_name_jp"] if "common_name_jp" in star.keys() else None
                ),
                bayer_designation=(
                    star["bayer_designation"]
                    if "bayer_designation" in star.keys()
                    else None
                ),
                hip_number=star["hip_number"] if "hip_number" in star.keys() else None,
                right_ascension=star["right_ascension"],
                declination=star["declination"],
                magnitude=star["magnitude"],
                constellation_id=constellation_id_map.get(star["constellation_id"]),
            )
            pg_session.add(new_star)
            pg_session.flush()
            star_id_map[star["id"]] = new_star.id

        # 星座線データの移行
        print("星座線データを移行中...")
        sqlite_cursor.execute("SELECT * FROM constellation_lines")
        lines = sqlite_cursor.fetchall()

        for line in lines:
            new_line = ConstellationLine(
                constellation_id=constellation_id_map.get(line["constellation_id"]),
                star1_id=star_id_map.get(line["star1_id"]),
                star2_id=star_id_map.get(line["star2_id"]),
            )
            pg_session.add(new_line)

        # コミット
        pg_session.commit()
        print("データ移行が完了しました。")
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        pg_session.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg_session.close()


def main():
    """メイン関数"""
    print("SQLiteからPostgreSQLへのデータ移行を開始します。")

    # PostgreSQLにテーブルを作成
    create_postgres_tables()  # engine variable is unused

    # データを移行
    migrate_data()

    print("データ移行が正常に完了しました。")


if __name__ == "__main__":
    main()
