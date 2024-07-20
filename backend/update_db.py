import sqlite3
import os

# Construye la ruta completa a la base de datos
DATABASE = os.path.join(os.path.dirname(__file__), 'database.db')

def update_db():
    conn = sqlite3.connect(DATABASE)
    cur = conn.cursor()
    
    # Verifica si las columnas existen antes de intentar agregarlas
    cur.execute("PRAGMA table_info(loans)")
    columns = [column[1] for column in cur.fetchall()]

    if 'start_date' not in columns:
        cur.execute("ALTER TABLE loans ADD COLUMN start_date TEXT")

    if 'payment_date' not in columns:
        cur.execute("ALTER TABLE loans ADD COLUMN payment_date TEXT")

    if 'months_paid' not in columns:
        cur.execute("ALTER TABLE loans ADD COLUMN months_paid INTEGER DEFAULT 0")
    
    conn.commit()
    conn.close()
    print("Base de datos actualizada exitosamente.")

if __name__ == '__main__':
    update_db()
