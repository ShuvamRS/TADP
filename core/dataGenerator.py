import json
from core.DB import *

COMPANY_DATA_FILE_NAME = "data/companyData.json"
COMPLAINT_TAGS_FILE_NAME = "data/complaintTags.txt"

def get_company_info():
	# Return company's name, address and # of complaints in the past 30 days
	
	companyInfo = []

	with open(COMPANY_DATA_FILE_NAME, 'r') as fh:
		for company_name, data_dict in json.load(fh).items():
			complaints = read_year(CompanyName=company_name)
			companyInfo.append({"Company name": company_name, "Address": data_dict["ADDRESS"], "Complaints": complaints})

	return companyInfo

def get_department_info(company_name):
	# Return department name and # of complaints in the past 30 days
	departmentInfo = []
	departments_seen = set()

	with open(COMPANY_DATA_FILE_NAME, 'r') as fh:
		try:
			departments = json.load(fh)[company_name]["DEPARTMENTS"]
			for department in departments:
				if department in departments_seen: continue
				complaints = read_year(CompanyName=company_name, Department=department)
				departmentInfo.append({"Department name": department, "Complaints": complaints})

		except KeyError:
			pass

	return departmentInfo

def get_complaint_info(company_name, department_name):
	return read_year(CompanyName=company_name, Department=department_name)

def get_complaint_tags():
	with open(COMPLAINT_TAGS_FILE_NAME, 'r') as fh:
		return fh.read().split('\n')