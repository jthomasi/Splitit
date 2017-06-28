// Include Server Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// schemas
var Home = require("./models/Home.js");
var Roommate = require("./models/Roommate.js");
var Bill = require("./models/Bill.js");

// Create Instance of Express
var app = express();
// Sets an initial port. We'll use this later in our listener
var PORT = process.env.PORT || 3000;

// Run Morgan for Logging
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(express.static("./public"));

// ----------------- MONGO_DB CONFIG -----------------------------

// MongoDB Configuration configuration (Change this URL to your own DB)
// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/Home_db");
// var db = mongoose.connection;

// db.on("error", function(err) {
//   console.log("Mongoose Error: ", err);
// });

// db.once("open", function() {
//   console.log("Mongoose connection successful.");
// });

// --------------------- HTML ROUTES -----------------------

app.use("/", function(req, res) {
  console.log("main page");
  res.sendFile(__dirname + "/public/index.html");
});

// --------------------- ADD ROUTES ------------------------

// creating a home account
app.post("/addhome", function(req, res) {
	var newHome = new Home(req.body);
	newHome.save(function(error, doc) {
	    if (error) {
	        console.log(error);
	    }
	    else {
	        console.log(doc);
	    }
	});
});

// adding a roommate to a home
app.post("/addroommate", function(req, res) {
    var newRoommate = new Roommate(req.body);
    newRoommate.save(function(error, doc) { 
    	if (error) {
     	    res.send(error);
    	}
    	else {
      		Home.findOneAndUpdate({}, { $push: { "roommates": doc._id } }, { new: true }, function(err, newdoc) {
        		if (err) {
          			res.send(err);
       			}
        		else {
          			res.send(newdoc);
        		}
      		});
    	}
    });
});

// adding a bill to a home
app.post("/addbill", function(req, res) {
    var newBill = new Bill(req.body);
    newBill.save(function(error, doc) { 
    	if (error) {
     	    res.send(error);
    	}
    	else {
      		Home.findOneAndUpdate({}, { $push: { "bills": doc._id } }, { new: true }, function(err, newdoc) {
        		if (err) {
          			res.send(err);
       			}
        		else {
          			res.send(newdoc);
        		}
      		});
    	}
    });
});

// ---------------------- DISPLAY ROUTES -------------------------

// route for dashboard information based off the login information
app.get("/dashboard", function(req, res) {
	// needs a unique _id from the home account
	Home.find({ "_id": req.body._id })
	    .populate(["bills", "roommates"])
	    .exec(function(error, doc) {
	        if (error) {
	        	res.send(error);
	        }
	        else {
	        	// might need to be trimmed down to just roommates and bills array
	        	res.send(doc);
	        }
	});
});

// --------------------- DELETE ROUTES ------------------------

// deleting a home by unique home _id value
app.get("/deletehome", function(req, res) {
	// selecting a home using the unique home _id and removing the home from mongo_db
    Home.findByIdAndRemove({ "_id": req.body._id }, function(err, newdoc) {
        if (err) {
            res.send(err);
          }
        else {
            res.send(newdoc);
        }
    });
});

// deleting a rommmate from the home
app.get("/deleteroommate", function(req, res) {
	// selecting a roommate using the unique roommate _id and removing from the related home in mongo_db
    Roommate.findByIdAndRemove({ "_id": req.body._id }, function(err, newdoc) {
        if (err) {
            res.send(err);
          }
        else {
            res.send(newdoc);
        }
    });
});

// deleting a bill from the home
app.get("/deletebill", function(req, res) {
	// selecting a bill using the unique bill _id and removing from the related home in mongo_db
    Bill.findByIdAndRemove({ "_id": req.body._id }, function(err, newdoc) {
        if (err) {
            res.send(err);
          }
        else {
            res.send(newdoc);
        }
    });
});

// ---------------- LISTENER -------------------

// Listener
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});