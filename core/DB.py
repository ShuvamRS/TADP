# This file is to be run for creating database to store complaint information.
# Functions are provided to insert and read data.

import sqlite3

DB_NAME = "data/complaintData.db"

def create():
	conn = sqlite3.connect(DB_NAME)
	cur = conn.cursor()
	sql = '''
		CREATE TABLE IF NOT EXISTS ComplaintInfo(
			Date date NOT NULL,
			UserEmail TEXT NOT NULL,
			CompanyName TEXT NOT NULL,
			Address TEXT NOT NULL,
			Department TEXT NOT NULL,
			ComplaintTag TEXT NOT NULL
		);
		'''
	cur.execute(sql)
	conn.commit()
	conn.close()

def insert(**kwargs):
	conn = sqlite3.connect(DB_NAME)
	cur = conn.cursor()

	row = [(k,v) for k,v in kwargs.items()]
	fields = [r[0] for r in row]
	values = [r[1] for r in row]

	nested_sql = ", ".join(fields)

	cur.execute(f"INSERT INTO ComplaintInfo (Date, {nested_sql}) VALUES (date('now'),?,?,?,?,?)", values)
	conn.commit()
	conn.close()



def read_month(**kwargs):
	conn = sqlite3.connect(DB_NAME)
	cur = conn.cursor()

	nested_sql = " AND ".join([k+'='+"'"+v+"'" for k,v in kwargs.items()])
	sql = f"SELECT Date, ComplaintTag FROM ComplaintInfo WHERE {nested_sql} AND Date >= date('now','-1 month');"
	cur.execute(sql)
	results = cur.fetchall()
	conn.commit()
	conn.close()

	return results

def read_year(**kwargs):
	conn = sqlite3.connect(DB_NAME)
	cur = conn.cursor()

	nested_sql = " AND ".join([k+'='+"'"+v+"'" for k,v in kwargs.items()])
	sql = f"SELECT Date, ComplaintTag FROM ComplaintInfo WHERE {nested_sql} AND Date >= date('now','-1 year');"
	cur.execute(sql)
	results = cur.fetchall()
	conn.commit()
	conn.close()

	return results


def read_all_month(**kwargs):
	conn = sqlite3.connect(DB_NAME)
	cur = conn.cursor()

	nested_sql = " AND ".join([k+'='+"'"+v+"'" for k,v in kwargs.items()])
	sql = f"SELECT * FROM ComplaintInfo WHERE {nested_sql} AND Date >= date('now','-1 month');"
	cur.execute(sql)
	results = cur.fetchall()
	conn.commit()
	conn.close()

	return results


if __name__ == "__main__":
	create()