var new_companyName='', new_companyAddress='', new_companyWebsite='', new_departmentNames=[];

function display_table_companyInfo(){
	var pre_table_html = `
			<div id=search>
				<h6>
					Search company/organization name

					<input id="textFilter" type="text">
				</h6>
			</div>
			<p>
  				Found <span id="searchCount"></span> matches for '<span id="searchText"></span>'.
			</p>
				`;

	var table_head_html = `
			<thead>
				<tr>
					  <th scope="col">#</th>
					  <th scope="col">Company/Organization</th>
					  <th scope="col">Address</th>
					  <th scope="col"># of complaints in past 30 days</th>
				</tr>
			</thead>
			`;


	var table_body_html = `<tbody id="main_table_body"></tbody>`;

	var table_html = `
				<table class="table table">
					${pre_table_html}
					${table_head_html}
					${table_body_html}
				</table>
				`;

	$("#main_table").html(table_html);
	if (DEBUG){
		var debug_html = '<div id="debug"><h6>This website was built as part of a course project for IN4MATX 133, User Interface Software, at the University of California, Irvine.<br>This website is currently running on debug mode and the data used/shown here are not genuine (dummy data).</h6></div><br>';
		$("header").append(debug_html);
	}
}

function prev_month_date(){
	var d = new Date();
	var newMonth = d.getMonth() - 1;
	if(newMonth < 0){
	    newMonth += 12;
	    d.setYear(d.getYear() - 1);
	}
	d.setMonth(newMonth);
	return d.toISOString().split('T')[0];
}

function date_is_within_30_days(q_date){
	prev_date = new Date(prev_month_date());
	query_date = new Date(q_date);

	return +query_date >= +prev_date

}

function display_vega_bargraph(){
	var values = [];

	// Deep copy COMPANY_INFO for sorting below
	var COMPANY_INFO_clone = JSON.parse(JSON.stringify(COMPANY_INFO));

	// Sort companies by complaint count in descending order
	COMPANY_INFO_clone.sort(function(a, b){return (b["Complaints"].length) - (a["Complaints"].length)});

	for (var i = 0; i < COMPANY_INFO_clone.length; i++){
		if (i == MAX_VIS) break; 
		var company_name = COMPANY_INFO_clone[i]["Company name"];
		// var abbreviation = company_name.match(/\(([0-9a-zA-Z]+)\)/);
		// if (abbreviation !== null) company_name = abbreviation[1];
		var cur_complaint = COMPANY_INFO_clone[i]["Complaints"];

		for (var j = 0; j < cur_complaint.length; j++){
			if (date_is_within_30_days(cur_complaint[j][0])){
				values.push({'Companies': company_name, 'Complaint Type':cur_complaint[j][1]});
			}
		}
	}

	var complaint_vis_spec = {
	  "description": "Bargraph showing complaint data for the past 1 month",
	  "data": {
	    "values": values
	  	},
	  "config": {
	    "axis": {
	    	"titleFont": "monospace",
			"labelFont": "monospace",
			"labelColor": "black",
			"labelFontSize": 15,
			"titleFontSize": 15,
			"labelLimit": 0,
			}
  		},
	  "mark": {
	  	"type": "bar",
	  },
	  "encoding": {
	    "y": {
			"field": "Companies",
			"type": "nominal",
			"title": null,
    	"sort": "-x"
		},
	    "x": {
	    	"aggregate": "count",
	    	"title": "Number of complaints in last 30 days",
	    	"field": "Complaint Type",
	    	"axis": {"tickMinStep": 1, "grid": true},
	    	"type": "quantitative",
	    },
	    "opacity": {"value": 1},
	    "color": {"value": "#618685"},
	    //"color": {"field": "Complaint Type", "type": "nominal"}
	  },
	  "width": window.innerWidth*0.5,
	  "height": {"step": 20},
	};

	vegaEmbed('#complaint_vis', complaint_vis_spec, {actions:false});
	$('#complaint_vis').append(`<button type="button" class="btn btn-success" onclick="display_vega_linechart()">View Linechart</button>`);
}


function display_vega_linechart(){
	var values = [];

	// Deep copy COMPANY_INFO for sorting below
	var COMPANY_INFO_clone = JSON.parse(JSON.stringify(COMPANY_INFO));

	// Sort companies by complaint count in descending order
	COMPANY_INFO_clone.sort(function(a, b){return (b["Complaints"].length) - (a["Complaints"].length)});

	for (var i = 0; i < COMPANY_INFO_clone.length; i++){
		if (i == MAX_VIS) break; 
		var company_name = COMPANY_INFO_clone[i]["Company name"];
		// var abbreviation = company_name.match(/\(([0-9a-zA-Z]+)\)/);
		// if (abbreviation !== null) company_name = abbreviation[1];
		var cur_complaint = COMPANY_INFO_clone[i]["Complaints"];

		for (var j = 0; j < cur_complaint.length; j++){
			values.push({'Companies': company_name, 'Complaint Type':cur_complaint[j][1], 'Time':cur_complaint[j][0]});
		}
	}

	var complaint_vis_spec = {
		"description": "Linechart of monthly complaint data for various companies/organizations.",
		"data": {"values": values},
		"config": {
		    "axis": {
		    	"titleFont": "monospace",
				"labelFont": "monospace",
				"labelColor": "black",
				"labelFontSize": 12,
				"titleFontSize": 15,
				"labelLimit": 0,
				}
  		},
		"mark": {
			"type": "line",
			"point": true
		},
		"encoding": {
			"x": {"field": "Time", "title": "Date", "timeUnit": "utcmonthdate", "type": "ordinal"},
			"y": {"aggregate":"count", "field": "Complaint Type", "title": "Number of complaints", "type": "quantitative"},
			"color": {"field": "Companies", "type": "nominal"}
  		},
  		"width": window.innerWidth*0.5,
	}
	vegaEmbed('#complaint_vis', complaint_vis_spec, {actions:false});
	$('#complaint_vis').append(`<button type="button" class="btn btn-success" onclick="display_vega_bargraph()">View Bargraph</button>`);
}


function addEventHandlerForSearch() {
	$("#searchCount").text(0);
	$("#searchText").text('');

	$('#textFilter').keyup(function() {
		$("#main_table_body").html('');
    	var query = $(this).val();
    	$("#searchText").text(query);
    	var count = 0;
    	
    	for (var i = 0; i < COMPANY_INFO.length; i++){
    		if (query == '') break;
    		if (COMPANY_INFO[i]["Company name"].toLowerCase().includes(query.toLowerCase())){
    			$("#main_table_body").append(`<tr class=main_table_tr onMouseOver="this.style.backgroundColor='lightblue'" onMouseOut="this.style.backgroundColor='#EEE2DC'" onClick="redirect('${i}');"><td>${++count}</td><td>${COMPANY_INFO[i]["Company name"]}</td><td>${COMPANY_INFO[i]["Address"]}</td><td>${COMPANY_INFO[i]["Complaints"].length}</td></tr>`);
    		}
    	}
    	$("#searchCount").text(count);
	});
}

function redirect(companyIndex){
	companyIndex = parseInt(companyIndex);
	var companyName = COMPANY_INFO[companyIndex]["Company name"];
	var companyAddress = COMPANY_INFO[companyIndex]["Address"];

	fetch('companyPage', {
		method:'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({"Name": companyName, "Address": companyAddress})
	}).then(
		(resp) => {
		  window.location.href = resp["url"];
		}
	);
}

function display_add_company(){
	new_companyName = "";
	new_companyAddress = "";
	new_companyWebsite = "";
	new_departmentNames = [];
	$("#add_company").html(`<button type="button" class="btn btn-success" onclick="display_company_name_input_field()">Add a new company/organization</button>`);
}

function display_company_name_input_field(){
	$("#add_company").html(`
		<br>
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Company/Organization Name" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success" onclick="display_company_address_input_field()">Continue</button>
		<button type="button" class="btn btn-danger" onclick="display_add_company()">Cancel</button>
	`);
}

function display_company_address_input_field(){
	new_companyName = $(".form-control").val();

	if (!new_companyName.match(/[0-9a-zA-Z]+/)) {
		display_add_company();
		return;
	}

	$("#add_company").html(`
		<br>
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Company Address" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success" onclick="display_company_website_input_field()">Continue</button>
		<button type="button" class="btn btn-danger" onclick="display_add_company()">Cancel</button>
	`);
}

function display_company_website_input_field(){
	new_companyAddress = $(".form-control").val();
	if (!new_companyAddress.match(/[0-9a-zA-Z]+/)) {
		display_add_company();
		return;
	}

	$("#add_company").html(`
		<br>
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Company Website" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success" onclick="display_company_department_input_field()">Continue</button>
		<button type="button" class="btn btn-danger" onclick="display_add_company()">Cancel</button>
	`);
}

function display_company_department_input_field(){
	new_companyWebsite = $(".form-control").val();
	if (!new_companyWebsite.match(/[0-9a-zA-Z]+/)) {
		display_add_company();
		return;
	}

	$("#add_company").html(`
		<br>
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Department Name" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success" onclick="submit_new_company()">Submit</button>
		<button type="button" class="btn btn-success" onclick="display_company_department_input_field_recurring()">Add another department</button>
		<button type="button" class="btn btn-danger" onclick="display_add_company()">Cancel</button>
	`);
}


function display_company_department_input_field_recurring(){
	var new_departmentName = $(".form-control").val();
	$(".form-control").val('');

	if (!new_departmentName.match(/[0-9a-zA-Z]+/)) {
		display_add_company();
		return;
	}
	
	new_departmentNames.push(new_departmentName);
	$("#add_company").html(`
		<br>
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Department Name" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success" onclick="submit_new_company()">Submit</button>
		<button type="button" class="btn btn-success" onclick="display_company_department_input_field_recurring()">Add another department</button>
		<button type="button" class="btn btn-danger" onclick="display_add_company()">Cancel</button>
	`);
}


function submit_new_company(){
	var new_departmentName = $(".form-control").val();
	if (new_departmentNames.length == 0 && !new_departmentName.match(/[0-9a-zA-Z]+/)) {
		display_add_company();
		return;
		}

	if (new_departmentName.match(/[0-9a-zA-Z]+/)) new_departmentNames.push(new_departmentName);
	
	if (DEBUG)
		alert("Data added successfully!");
	else
		alert("Thank you for helping us learn!\nWe will update our database as soon as the new information is verified.\nThis could take up to 24 hours.");

	fetch(window.location.href, {
		method:'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({"Name": new_companyName, "Address": new_companyAddress, "Website": new_companyWebsite, "Departments": new_departmentNames})
	}).then(
		(resp) => {
		  window.location.reload();
		});
}


$(document).ready(function (){
	// window.onresize = display_vega_linechart;
	window.onresize = display_vega_bargraph;
	display_table_companyInfo();
	addEventHandlerForSearch();
	display_add_company();
	// display_vega_linechart();
	display_vega_bargraph();
});
