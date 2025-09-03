import datetime
import psycopg2
import os
import urllib.parse as up

def log_entry(text, mood, url):
    try:
        db_url = os.environ.get("DATABASE_URL")

        # Parse DB URL for psycopg2 compatibility
        up.uses_netloc.append("postgres")
        conn = psycopg2.connect(db_url)

        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mood_logs (
                id SERIAL PRIMARY KEY,
                text TEXT,
                mood TEXT,
                url TEXT,
                timestamp TIMESTAMP
            )
        """)
        cursor.execute("INSERT INTO mood_logs (text, mood, url, timestamp) VALUES (%s, %s, %s, %s)",
                       (text, mood, url, datetime.datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("DB Error:", e)
