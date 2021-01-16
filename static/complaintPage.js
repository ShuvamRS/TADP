var tags_init_config = {};
var selected_tags = [];
var new_complaint_tags = [];
var COMPLAINT_TAGS_LOWER_CASE = [];

function display_page(){
	$("header").append(`<h2>${COMPANY_NAME} - ${DEPARTMENT_NAME}</h2><h5>${COMPANY_ADDRESS}</h5><br>`);
	if (DEBUG){
		var debug_html = '<div id="debug"><h6>This website was built as part of a course project for IN4MATX 133, User Interface Software, at the University of California, Irvine.<br>This website is currently running on debug mode and the data used/shown here are not genuine (dummy data).</h6></div><br>';
		$("header").append(debug_html);
	}

	$("header").append(`<h4>You may submit 1 complaint every 30 days using your official company/organization email address.</h4><h4>Please choose up to ${MAX_COMPLAINT_TAGS} complaint tags:</h4><br>`);
}



function display_complaint_tags(){
	var window_width = window.innerWidth;
	var tags = ``;
	n= 11;
	if (window_width < 620) n = 3;
	else if (window_width < 730) n = 4;
	else if (window_width < 900) n = 5;
	else if (window_width < 980) n = 6;
	else if (window_width < 1050) n = 7;
	else if (window_width < 1320) n = 8;
	else if (window_width < 1400) n = 9;
	else if (window_width < 1490) n = 10;

	for(var i=0; i < COMPLAINT_TAGS.length; i++){
		// Display at most n tags in a single row
		if (i % n == 0) tags += `<br><br>`;
		tags += `<button type="button" class="btn btn-dark mr-3" onclick="clickHandler(this)">${COMPLAINT_TAGS[i]}</button>`;
	}

	input_submit_html = `
		<br><br>
		<div class="d-flex justify-content-center">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" placeholder="Your email address" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success mr-2" onclick="submit_complaint()">Submit complaint</button>
		<button type="button" class="btn btn-danger mr-2" onclick="location.reload()">Cancel</button>
	`;

	$("#complaint_tags").html(tags);
	$("#complaint_tags").append(input_submit_html);
	
}


function clickHandler(_this){
	// Save the initial configuration of button into dictionary
	if (tags_init_config[_this.textContent] !== undefined){
		_this.style = tags_init_config[_this.textContent].style;
		delete tags_init_config[_this.textContent];
		for (var i = 0; i < selected_tags.length; i++){
			if (selected_tags[i].textContent === _this.textContent){
				selected_tags.splice(i, 1);
			}
		}
		return
	}

	tags_init_config[_this.textContent] = _this;
	
	if (selected_tags.length == MAX_COMPLAINT_TAGS){
		pop_item = selected_tags.shift();
		pop_item.style = tags_init_config[pop_item.textContent].style;
	}

	selected_tags.push(_this);
	_this.style.backgroundColor = "#1e9076";
}


function submit_complaint(){
	var email =  $(".form-control").val();

	// Copied from https://emailregex.com/
	const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

	if (selected_tags.length === 0){
		alert("Choose at least 1 complaint tag");
		return;
	}

	if (email == ""){
		alert("You must enter your email address");
		return;
	}

	if (!email.match(regex)){
		alert("Enter a valid email address");
		return;
	}

	var complaint_tags = [];
	for (var i=0; i<selected_tags.length; i++) complaint_tags.push(selected_tags[i].textContent);

	if (DEBUG)
		alert("Your complaint will be processed soon!");
	else
		alert("Thank you for submitting your complaint!\nWe will update our database as soon as your complaint is verified.\nThis could take up to 24 hours.");


	fetch('complaints', {
		method:'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({"Submitted Complaint Tags": complaint_tags, "Email": email})
	}).then(
		(resp) => {
		  window.location.reload();
		});
}


function display_tag_add(){
	$("#add_complaint_tags").html(`<button type="button" class="btn btn-success" onclick="add_new_tag()">Add a new complaint tag</button>`);
}

function add_new_tag(){
	new_html = `
		<div class="d-flex justify-content-left">
			<div class="input-group mb-3">
			  <input type="text" class="form-control" id="new_tag_input" placeholder="New complaint tag" aria-label="Default" aria-describedby="inputGroup-sizing-default">
			</div>
		</div>
		<button type="button" class="btn btn-success mr-2" onclick="submit_complaint_tags()">Submit</button>
		<button type="button" class="btn btn-success mr-2" onclick="add_new_tag_recurring()">Add another tag</button>
		<button type="button" class="btn btn-danger mr-2" onclick="location.reload()">Cancel</button>
	`;
	$("#add_complaint_tags").html(new_html);
}


function add_new_tag_recurring(){
	var newComplaintTag = $("#new_tag_input").val();

	if (COMPLAINT_TAGS_LOWER_CASE.includes(newComplaintTag.toLowerCase())) {
		alert(`${newComplaintTag} Tag already exists!`);
		$("#new_tag_input").val("");
		return;
	}

	if (!newComplaintTag.match(/[0-9a-zA-Z]+/)) {
		alert("Invalid complaint tag!");
		$("#new_tag_input").val("");
		return;
	}

	new_complaint_tags.push(newComplaintTag);
	$("#new_tag_input").val("");
}


function submit_complaint_tags(){
	var newComplaintTag = $("#new_tag_input").val();

	if (COMPLAINT_TAGS_LOWER_CASE.includes(newComplaintTag.toLowerCase())) {
		alert(`${newComplaintTag} Tag already exists!`);
		$("#new_tag_input").val("");
		return;
	}

	if (!newComplaintTag.match(/[0-9a-zA-Z]+/)) {
		alert("Invalid complaint tag!");
		$("#new_tag_input").val("");
		return;
	}

	if (newComplaintTag !== "") new_complaint_tags.push(newComplaintTag);

	if (DEBUG)
		alert("Data added successfully!");
	else
		alert("Thank you for helping us learn!\nWe will update our database as soon as the new information is verified.\nThis could take up to 24 hours.");

	fetch('complaints', {
		method:'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({"New Complaint Tags": new_complaint_tags})
	}).then(
		(resp) => {
		  window.location.reload();
		});

}


$(document).ready(function (){
	COMPLAINT_TAGS_LOWER_CASE = COMPLAINT_TAGS.map(v => v.toLowerCase());
	display_page();
	display_complaint_tags();
	display_tag_add();
	window.onresize = display_complaint_tags;
});