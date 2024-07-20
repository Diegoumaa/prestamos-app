import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), 'database.db')

def create_db():
    conn = sqlite3.connect(DATABASE)
    cur = conn.cursor()
    
    cur.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )''')
    
    cur.execute('''CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        capital REAL NOT NULL,
        abonos REAL NOT NULL,
        porcentaje REAL NOT NULL,
        cuota REAL NOT NULL,
        start_date TEXT NOT NULL,
        payment_date TEXT NOT NULL
    )''')
    
    conn.commit()
    conn.close()
    print("Base de datos y tablas creadas exitosamente.")

if __name__ == '__main__':
    create_db()
