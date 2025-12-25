import mysql.connector

def get_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="bookstore",
        port=3306 # TODO: no need to hardcode port so delete later
    )
    return conn
