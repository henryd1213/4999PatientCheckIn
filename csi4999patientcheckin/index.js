const express = require("express");
const mysql = require("mysql");
const ejs = require("ejs");


// Create express app
const app = express();

// Create a database connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "PatientInfo", // Database used
});

// Establish connection with the DB
db.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Successful connected to the DB....`);
  }
});

// Initialize Body Parser Middleware to parse data sent by users in the request object
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse HTML form data

// Initialize ejs Middleware
app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

// routes

//Renders initial index page
app.get("/", (req, res) => {
  res.render("index");
});

//A function for buttons to return to the index page
app.get("/home_return", (req, res) => {
  res.render("index");
});

//A function for buttons to return to the pin authentication page
app.get("/pin_return", (req, res) => {
  res.render("pin_auth");
});

//A function for buttons to return to the admin terminal page
app.get("/admin_list_return", (req, res) => {
  res.render("adminTerminal");
});

app.get("/doctor_return", (req, res) => {
  res.render("doctorPage");
});

app.get("/nurse_return", (req, res) => {
  res.render("nursePage");
});

app.get("/admin_pin_return", (req, res) => {
  res.render("adminPinAuth");
});

app.get("/doctor_pin_return", (req, res) => {
  res.render("doctorPinAuth");
});

app.get("/nurse_pin_return", (req, res) => {
  res.render("nursePinAuth");
});

app.get("/login_return", (req, res) => {
  res.render("login");
});

app.get("/login_page", (req, res) => {
  res.render("login");
});

app.get("/new_user", (req, res) => {
  res.render("newUser");
});

app.get("/accountInfoLogin", (req, res) => {
  res.render("accountInfoLogin");
});

app.get("/passReset_return", (req, res) => {
  res.render("passReset");
});

app.get("/remove_user", (req, res) => {
  let sql = `SELECT * FROM Employee_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("removeUser", { data: result });
  });
});

//Function called from index page when settings is selected to render page to enter pin
app.get("/pin_page", (req, res) => {
  let sql = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("pin_auth", { data: result });
  });
});

//Function to verify pin against existing pin entries
//If successful verification, render admin page
//If failed verficiation, display message and return to index page
app.post("/login_auth", (req, res) => {
  let sql = `SELECT * FROM Employee_Info WHERE Employee_Info.Username='${req.body.username}' AND Employee_Info.Password='${req.body.password}'`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] ==undefined){
      res.send('<script>alert("Invalid Username or Password"); window.location.href = "/login_return"; </script>');
    }
    else if (result[0].Role == "Nurse"){
      if (result[0].FPass == "Y"){
        res.send('<script>alert("Password expired, please reset"); window.location.href = "/passReset_return"; </script>');
      }else{
    res.render("nursePage", { data: result });
      }
    }
    else if (result[0].Role == "Doctor"){
      res.render("doctorPage", { data: result });
    }
    else if (result[0].Role == "Admin"){
      res.render("adminTerminal", { data: result });
    }
  });
});

app.post("/admin_pin_auth", (req, res) => {
  let sql = `SELECT * FROM Pin_Info WHERE Pin_Info.Pin='${req.body.pin}'`;
  let sql2 = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] ==undefined){
      res.send('<script>alert("Invalid Pin"); window.location.href = "/nurse_pin_return"; </script>');
    }
    else {
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        else {
          res.render("adminPatientList", { data: result });
        }
      });
    }
  });
});

app.post("/doctor_pin_auth", (req, res) => {
  let sql = `SELECT * FROM Pin_Info WHERE Pin_Info.Pin='${req.body.pin}'`;
  let sql2 = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] ==undefined){
      res.send('<script>alert("Invalid Pin"); window.location.href = "/nurse_pin_return"; </script>');
    }
    else {
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        else {
          res.render("doctorPatientList", { data: result });
        }
      });
    }
  });
});

app.post("/nurse_pin_auth", (req, res) => {
  let sql = `SELECT * FROM Pin_Info WHERE Pin_Info.Pin='${req.body.pin}'`;
  let sql2 = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] ==undefined){
      res.send('<script>alert("Invalid Pin"); window.location.href = "/nurse_pin_return"; </script>');
    }
    else {
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        else {
          res.render("nursePatientList", { data: result });
        }
      });
    }
  });
});

//function to sort through selections from admin page. Will be updated to include more selections
app.get("/admin_selection", (req, res) => {
  let sql = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("adminPinAuth", { data: result });
  });
});

app.get("/nurse_selection", (req, res) => {
  let sql = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("nursePinAuth", { data: result });
  });
});

app.get("/doctor_selection", (req, res) => {
  let sql = `SELECT * FROM Patient_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("doctorPinAuth", { data: result });
  });
});


app.post("/addUser", (req, res) => {
  let data1 = {ID: 0, Fname: req.body.Fname, Lname: req.body.Lname, Email: req.body.Email, 
    Phone: req.body.Phone, Gender: req.body.Gender, Age: req.body.Age,
    Birthday: req.body.Birthday, Username: req.body.Username, Password: req.body.Password, Role: req.body.Profession, FPass: 'Y'};
  let sql1 = `INSERT INTO Employee_Info SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
        throw err;
      }
      res.send('<script>alert("User added to system"); window.location.href = "/admin_list_return"; </script>');
  });
});

app.post("/deleteUser", (req, res) => {
  let lname = req.body.Lname;
  let fname = req.body.Fname;
  let email = req.body.Email;
  let username= req.body.Username;
  let sql = `DELETE FROM Employee_Info WHERE ID =(SELECT ID WHERE Lname='${req.body.Lname}' OR Fname='${req.body.Fname}' OR Email='${req.body.Email}' OR Username='${req.body.Username}')`;
  let query1 = db.query(sql, (err, result) => {
    if (err) {
        throw err;
      }
      
        res.send('<script>alert("User removed from system"); window.location.href = "/remove_user"; </script>');
  });
});



app.post("/accountInfo", (req, res) => {
let sql = `SELECT * FROM Employee_Info WHERE Employee_Info.Username='${req.body.username}' AND Employee_Info.Password='${req.body.password}'`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] ==undefined){
      res.send('<script>alert("Invalid Pin"); window.location.href = "/login_return"; </script>');
    }
    else {
    res.render("accountInfo", { data: result });
    }
  });
});

app.post("/accountChanges", (req, res) => {  
  if(req.body.submit=="Edit Information")  {
let sql1 = `UPDATE TICKET SET PURCHASER_ID='1' WHERE TICKET.ID=(SELECT ID WHERE PURCHASER_ID=(SELECT ID FROM PURCHASER WHERE PURCHASER.Name='${req.body.names}' AND PURCHASER.Email='${req.body.emails}'))`;
db.query(sql1, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(`Page not yet built.`);
  });  
} else if(req.body.submit=="Reset Password"){
      let sql1 = `SELECT * FROM Employee_Info WHERE ID='${req.body.ID}'`;
      db.query(sql1, (err, result) => {
          if (err) {
            throw err;
          }
          res.render("passReset", { data: result });
        });
  }else{
    res.send(`Page not yet built.`);

  }
});

app.post("/passReset", (req, res) => {
  let sql = `SELECT * FROM Employee_Info WHERE Employee_Info.Password='${req.body.oldPass}'`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] ==undefined){
        res.send('<script>alert("Incorrect current password"); window.location.href = "/home_return"; </script>');
      }
      else {
        let sql = `UPDATE Employee_Info SET Password='${req.body.newPass}' WHERE ID=(SELECT ID WHERE Password='${req.body.oldPass}')`;
        db.query(sql, (err, result) => {
          if (err) {
            throw err;
          }
          else{
            let sql = `UPDATE Employee_Info SET FPass='N' WHERE ID=(SELECT ID WHERE Password='${req.body.newPass}')`;
            db.query(sql, (err, result) => {
              if (err) {
                throw err;
              }
              else{
            res.send(`Password Reset.`);
        
          }
        });
      }
        });
      }
    });
  });

// Setup server ports
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

