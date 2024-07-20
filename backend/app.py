import os
from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = os.urandom(24)

DATABASE = 'backend/database.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    return conn

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        message = "Usuario registrado exitosamente"
    except sqlite3.IntegrityError:
        message = "El nombre de usuario ya existe"
    conn.close()
    return jsonify({"message": message})

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = cur.fetchone()
    conn.close()
    if user:
        session['user'] = user[0]
        return jsonify({"message": "Inicio de sesión exitoso"})
    else:
        return jsonify({"message": "Usuario o contraseña incorrectos"}), 401

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route('/loans', methods=['GET', 'POST'])
def loans():
    if 'user' not in session:
        return redirect(url_for('login'))
    conn = get_db()
    cur = conn.cursor()
    if request.method == 'POST':
        data = request.get_json()
        capital = float(data['capital'])
        porcentaje = float(data['porcentaje'])
        cuota = capital * (porcentaje / 100)
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        months_paid = int(data['months_paid'])
        payment_date = start_date + timedelta(days=30 * months_paid)
        cur.execute("INSERT INTO loans (name, capital, abonos, porcentaje, cuota, start_date, payment_date, months_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (data['name'], capital, 0, porcentaje, cuota, data['start_date'], payment_date.strftime('%Y-%m-%d'), months_paid))
        conn.commit()
        return jsonify({"message": "Préstamo registrado exitosamente"})
    cur.execute("SELECT * FROM loans")
    loans = cur.fetchall()
    conn.close()
    loans_dict = [{"id": loan[0], "name": loan[1], "capital": loan[2], "abonos": loan[3], "porcentaje": loan[4], "cuota": loan[5], "start_date": loan[6], "payment_date": loan[7], "months_paid": loan[8]} for loan in loans]
    return jsonify(loans_dict)

@app.route('/loans/<int:loan_id>', methods=['GET', 'PUT', 'DELETE'])
def loan(loan_id):
    if 'user' not in session:
        return redirect(url_for('login'))
    conn = get_db()
    cur = conn.cursor()
    if request.method == 'GET':
        cur.execute("SELECT * FROM loans WHERE id=?", (loan_id,))
        loan = cur.fetchone()
        conn.close()
        if loan:
            return jsonify({"id": loan[0], "name": loan[1], "capital": loan[2], "abonos": loan[3], "porcentaje": loan[4], "cuota": loan[5], "start_date": loan[6], "payment_date": loan[7], "months_paid": loan[8]})
        else:
            return jsonify({"message": "Préstamo no encontrado"}), 404
    elif request.method == 'PUT':
        data = request.get_json()
        abonos = float(data['abonos'])
        months_paid = int(data['months_paid'])
        
        cur.execute("SELECT capital, abonos, porcentaje, start_date FROM loans WHERE id=?", (loan_id,))
        loan = cur.fetchone()
        if loan:
            capital = loan[0] - loan[1] - abonos  # Restamos los abonos anteriores y los nuevos del capital
            if capital < 0:
                return jsonify({"message": "El abono excede el capital restante"}), 400
            porcentaje = loan[2]
            cuota = capital * (porcentaje / 100)
            start_date = datetime.strptime(loan[3], '%Y-%m-%d')
            new_payment_date = start_date + timedelta(days=30 * months_paid)
            new_payment_date_str = new_payment_date.strftime('%Y-%m-%d')

            cur.execute("UPDATE loans SET abonos=abonos + ?, capital=?, cuota=?, months_paid=?, payment_date=? WHERE id=?", 
                        (abonos, capital, cuota, months_paid, new_payment_date_str, loan_id))
            conn.commit()
            conn.close()
            return jsonify({"message": "Préstamo actualizado exitosamente"})
        else:
            conn.close()
            return jsonify({"message": "Préstamo no encontrado"}), 404
    elif request.method == 'DELETE':
        cur.execute("DELETE FROM loans WHERE id=?", (loan_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Préstamo eliminado exitosamente"})

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
