import sqlite3


def is_sqlite(file):
    con = sqlite3.connect(file)
    cur = con.cursor()
    try:
        cur.execute("PRAGMA integrity_check")
        return True
    except sqlite3.DatabaseError:
        con.close()
        return
