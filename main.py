import json
import os
from flask import Flask, render_template, request
from core.dataGenerator import *
import sys


DEBUG = True
MAX_COMPLAINT_TAGS = 3
MAX_VIS = 20
COMPANY_VERIFY_FILE_PATH = os.path.join("verify", "companyVerify.json")
COMPLAINT_TAG_VERIFY_FILE_PATH = os.path.join("verify", "complaintTagVerify.txt")
DEPARTMENT_VERIFY_FILE_PATH = os.path.join("verify", "departmentVerify.json")
COMPLAINT_VERIFY_FILE_PATH = os.path.join("verify", "complaintVerify.json")

app = Flask(__name__)

@app.route("/", methods = ['GET', 'POST'])
def homePage():
	companyInfo = sorted(get_company_info(), key=lambda x: x["Company name"].lower())

	if request.method == "POST":
		newCompanyInfo = request.get_json()

		if DEBUG:
			with open(COMPANY_DATA_FILE_NAME, 'r') as fh:
				company_data = json.load(fh)
				company_data[newCompanyInfo["Name"]] = {"ADDRESS": newCompanyInfo["Address"], "WEBSITE URL": newCompanyInfo["Website"], "DEPARTMENTS": newCompanyInfo["Departments"]}
				with open(COMPANY_DATA_FILE_NAME, 'w') as fh:
					json.dump(company_data, fh, indent=2)

		else:
			# Store new company information into json file for manual verification
			try:
				with open(COMPANY_VERIFY_FILE_PATH, 'a') as fh:
					json.dump(request.get_json(), fh, indent=2)
			except FileNotFoundError:
				with open(COMPANY_VERIFY_FILE_PATH, 'w') as fh:
					json.dump(request.get_json(), fh, indent=2)

	return render_template("homePage.html", companyInfo=companyInfo, MAX_VIS=MAX_VIS, DEBUG=DEBUG)


@app.route("/companyPage", methods = ['GET', 'POST'])
def companyPage():
	companyInfo = get_company_info()
	company_names = [info["Company name"] for info in companyInfo]
	company_addresses = [info["Address"] for info in companyInfo]
	global companyName, companyAddress, departmentInfo

	if request.method == "POST":
		try:
			# POST request for loading information about a company
			companyInfo_POST = request.get_json()
			companyName = companyInfo_POST["Name"]
			companyAddress = companyInfo_POST["Address"]
			departmentInfo = sorted(get_department_info(companyName), key=lambda x: x["Department name"].lower())

		except KeyError:
			# Post request to add a new department
			newDepartment = request.get_json()["Department Name"]

			if DEBUG:
				with open(COMPANY_DATA_FILE_NAME, 'r') as fh:
					company_data = json.load(fh)
					try:
						if newDepartment not in company_data[companyName]["DEPARTMENTS"]:
							company_data[companyName]["DEPARTMENTS"].append(newDepartment)
					except KeyError:
						company_data[companyName]["DEPARTMENTS"] = [newDepartment]

				with open(COMPANY_DATA_FILE_NAME, 'w') as fh:
					json.dump(company_data, fh, indent=2)

			else:
				# Store new company information into json file for manual verification
				try:
					with open(DEPARTMENT_VERIFY_FILE_PATH, 'a') as fh:
						json.dump({"Company Name": companyName, "Address": companyAddress, "Department Name": newDepartment}, fh, indent=2)
				except FileNotFoundError:
					with open(DEPARTMENT_VERIFY_FILE_PATH, 'w') as fh:
						json.dump({"Company Name": companyName, "Address": companyAddress, "Department Name": newDepartment}, fh, indent=2)

			departmentInfo = sorted(get_department_info(companyName), key=lambda x: x["Department name"].lower())
	
	return render_template("companyPage.html", companyName=companyName, companyAddress=companyAddress, departmentInfo=departmentInfo, MAX_VIS=MAX_VIS, DEBUG=DEBUG)
	

@app.route("/complaints", methods = ['GET', 'POST'])
def complaintPage():
	complaintTags = sorted(get_complaint_tags())

	global departmentName, complaint_info
	if request.method == "POST":
		try:
			# POST request for fetching department name
			departmentName = request.get_json()["Department name"]
			complaint_info = get_complaint_info(companyName, departmentName)

		except KeyError:
			try:
				# Post request for adding new complaint tags
				new_complaintTags = request.get_json()["New Complaint Tags"]

				if DEBUG:
					with open(COMPLAINT_TAGS_FILE_NAME, 'a') as fh:
						fh.write('\n'.join(new_complaintTags)+'\n')

				else:
					try:
						# Store new complaint tags into json file for manual verification
						with open(COMPLAINT_TAG_VERIFY_FILE_PATH, 'a') as fh:
							fh.write('\n'.join(new_complaintTags)+'\n')

					except FileNotFoundError:
						with open(COMPLAINT_TAG_VERIFY_FILE_PATH, 'w') as fh:
							fh.write('\n'.join(new_complaintTags)+'\n')

					
			except KeyError:
				# Post request for submitting new complaint
				submitted_complaint_tags = request.get_json()["Submitted Complaint Tags"]
				email = request.get_json()["Email"]

				if DEBUG:
					usercomplaintFreq = len(read_month(UserEmail=email))
					if usercomplaintFreq < 3:
						for t in submitted_complaint_tags:
							insert(UserEmail=email, CompanyName=companyName, Address=companyAddress, Department=departmentName, ComplaintTag=t)
					else:
						# Printed in debug mode only
						print(f"{email} has been used.", file=sys.stderr)

				else:
					# Store new complaint data into json file for manual verification
					try:
						with open(COMPLAINT_VERIFY_FILE_PATH, 'a') as fh:
							json.dump({"Company Name": companyName, "Address": companyAddress, "Department Name": departmentName, "Complaint Tags": submitted_complaint_tags, "User Email": email}, fh, indent=2)
					except FileNotFoundError:
						with open(COMPLAINT_VERIFY_FILE_PATH, 'w') as fh:
							json.dump({"Company Name": companyName, "Address": companyAddress, "Department Name": departmentName, "Complaint Tags": submitted_complaint_tags, "User Email": email}, fh, indent=2)


	return render_template("complaintPage.html", companyName=companyName, companyAddress=companyAddress, departmentName=departmentName, complaintInfo=complaint_info, complaintTags=complaintTags, MAX_COMPLAINT_TAGS=MAX_COMPLAINT_TAGS, DEBUG=DEBUG)


if __name__ == "__main__":
	app.run(debug=False)