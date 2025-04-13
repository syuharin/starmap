import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# .envファイルから環境変数を読み込む
load_dotenv()

# 環境変数からデータベース接続URLを取得、なければSQLiteをデフォルトとする
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./starmap.db")

# PostgreSQLかSQLiteかを判断
is_postgres = DATABASE_URL.startswith("postgresql")

# エンジン作成（PostgreSQLとSQLiteで設定が異なる）
if is_postgres:
    engine = create_engine(DATABASE_URL)
else:
    # SQLite用の設定
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# データベースセッションの依存関係
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
