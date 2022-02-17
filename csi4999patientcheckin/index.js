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

app.get("/info_login_return", (req, res) => {
  res.render("accountInfoLogin");
});

app.get("/login_page", (req, res) => {
  res.render("login");
});


app.get("/new_form", (req, res) => {
  let sql = `SELECT * FROM Employee_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("newform", { data: result });
  });
});

app.get("/new_user", (req, res) => {
  let sql = `SELECT * FROM Employee_Info`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("newUser", { data: result });
  });
});


app.get("/accountInfoLogin", (req, res) => {
  res.render("accountInfoLogin");
});

app.get("/passReset_return", (req, res) => {
  res.render("passReset");
});



app.get("/qOne_render", (req, res) => {
  let sql = `SELECT * FROM form_List`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0].Apperance == "1" && result[0].Name == "GeneralInfo") {
      res.render("Q1", { data: result });
    }
    else {

      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='${result[1].Apperance}') AND Q_apperance="1"`;
      let sql2 = `SELECT * FROM Patient_Info`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("dynamicQ1", { data: result1, user: result2 });
        });

      });
    }
  });
});


app.get("/qOneNext_render", (req, res) => {
  let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="1"`;
  let sql2 = `SELECT * Patient_Info`;
  db.query(sql, sql2, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("dynamicQ1", { data: result });
  });
});

app.get("/qTwo_render", (req, res) => {
  let sql = `SELECT * FROM form_List`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[1].Apperance == "1") {
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='${result[1].Apperance}') AND Q_apperance="2"`;
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        res.render("dynamicQ2", { data: result });
      });
    }
  });
});


app.get("/remove_user", (req, res) => {
  let sql1 = `SELECT * FROM Employee_Info`;
  db.query(sql1, (err, result) => {
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



app.get("/form_list", (req, res) => {
  let sql1 = `SELECT * FROM Form_List`;
  db.query(sql1, (err, result) => {
    if (err) {
      throw err;
    }

    res.render("formList", { data: result });
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
    if (result[0] == undefined) {
      res.send('<script>alert("Invalid Username or Password"); window.location.href = "/login_return"; </script>');
    }
    else if (result[0].Role == "Nurse") {
      if (result[0].FPass == "Y") {
        res.send('<script>alert("Password expired, please reset"); window.location.href = "/passReset_return"; </script>');
      } else {
        res.render("nursePage", { data: result });
      }
    }
    else if (result[0].Role == "Doctor") {
      if (result[0].FPass == "Y") {
        res.send('<script>alert("Password expired, please reset"); window.location.href = "/passReset_return"; </script>');
      } else {
        res.render("doctorPage", { data: result });
      }
    }
    else if (result[0].Role == "Admin") {
      if (result[0].FPass == "Y") {
        res.send('<script>alert("Password expired, please reset"); window.location.href = "/passReset_return"; </script>');
      } else {
        res.render("adminTerminal", { data: result });
      }
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
    if (result[0] == undefined) {
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
    if (result[0] == undefined) {
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
    if (result[0] == undefined) {
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
  let data1 = {
    ID: 0, Fname: req.body.Fname, Lname: req.body.Lname, Email: req.body.Email,
    Phone: req.body.Phone, Gender: req.body.Gender, Age: req.body.Age,
    Birthday: req.body.Birthday, Username: req.body.Username, Password: req.body.Password, Role: req.body.Profession, FPass: 'Y', Form_List_ID: '1'
  };
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
  let username = req.body.Username;
  let sql = `DELETE FROM Employee_Info WHERE ID =(SELECT ID WHERE Lname='${req.body.Lname}' OR Fname='${req.body.Fname}' OR Email='${req.body.Email}' OR Username='${req.body.Username}')`;
  let query1 = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }

    res.send('<script>alert("User removed from system"); window.location.href = "/admin_list_return"; </script>');
  });
});



app.post("/accountInfo", (req, res) => {
  let sql = `SELECT * FROM Employee_Info WHERE Employee_Info.Username='${req.body.username}' AND Employee_Info.Password='${req.body.password}'`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] == undefined) {
      res.send('<script>alert("Invalid username or password"); window.location.href = "/info_login_return"; </script>');
    }
    else {
      res.render("accountInfo", { data: result });
    }
  });
});

app.post("/terminalReturn", (req, res) => {
  let sql = `SELECT * FROM Employee_Info WHERE ID='${req.body.id}'`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0].Role == "Nurse") {

      res.render("nursePage", { data: result });
    }

    else if (result[0].Role == "Doctor") {

      res.render("doctorPage", { data: result });
    }

    else if (result[0].Role == "Admin") {

      res.render("adminTerminal", { data: result });
    }

  });
});

app.post("/accountChanges", (req, res) => {
  if (req.body.submit == "Edit Information") {
    let sql1 = `UPDATE TICKET SET PURCHASER_ID='1' WHERE TICKET.ID=(SELECT ID WHERE PURCHASER_ID=(SELECT ID FROM PURCHASER WHERE PURCHASER.Name='${req.body.names}' AND PURCHASER.Email='${req.body.emails}'))`;
    db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
      res.send(`Page not yet built.`);
    });
  } else if (req.body.submit == "Reset Password") {
    let sql1 = `SELECT * FROM Employee_Info WHERE ID='${req.body.id}'`;
    db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
      res.render("passReset", { data: result });
    });
  } else {
    let sql = `SELECT * FROM Employee_Info WHERE ID='${req.body.id}'`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0].Role == "Nurse") {

        res.render("nursePage", { data: result });
      }

      else if (result[0].Role == "Doctor") {

        res.render("doctorPage", { data: result });
      }

      else if (result[0].Role == "Admin") {

        res.render("adminTerminal", { data: result });
      }

    });


  }

});

app.post("/passReset", (req, res) => {
  let sql = `SELECT * FROM Employee_Info WHERE Employee_Info.Username='${req.body.username}'`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] == undefined) {
      res.send('<script>alert("Incorrect current password"); window.location.href = "/home_return"; </script>');
    }
    else {
      let sql = `UPDATE Employee_Info SET Password='${req.body.newPass}' WHERE ID=(SELECT ID WHERE Username='${req.body.username}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        else {
          let sql = `UPDATE Employee_Info SET FPass='N' WHERE ID=(SELECT ID WHERE Username='${req.body.username}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            else {
              res.send(`Password Reset.`);

            }
          });
        }
      });
    }
  });
});

app.post("/formChanges", (req, res) => {
  formName1 = req.body.form1
  formName2 = req.body.form2
  formName3 = req.body.form3
  formName4 = req.body.form4
  formName5 = req.body.form5
  formName6 = req.body.form6
  formName7 = req.body.form7
  formName8 = req.body.form8
  formName9 = req.body.form9
  formName10 = req.body.form10
  formPosition1 = req.body.Position1
  formPosition2 = req.body.Position2
  formPosition3 = req.body.Position3
  formPosition4 = req.body.Position4
  formPosition5 = req.body.Position5
  formPosition6 = req.body.Position6
  formPosition7 = req.body.Position7
  formPosition8 = req.body.Position8
  formPosition9 = req.body.Position9
  formPosition10 = req.body.Position10

  let sql1 = `UPDATE Form_List SET Apperance='${formPosition1}' WHERE ID=(SELECT ID WHERE Name='${formName1}')`;
  let query1 = db.query(sql1, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql2 = `UPDATE Form_List SET Apperance='${formPosition2}' WHERE ID=(SELECT ID WHERE Name='${formName2}')`;
  let query2 = db.query(sql2, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql3 = `UPDATE Form_List SET Apperance='${formPosition3}' WHERE ID=(SELECT ID WHERE Name='${formName3}')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql4 = `UPDATE Form_List SET Apperance='${formPosition4}' WHERE ID=(SELECT ID WHERE Name='${formName4}')`;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql5 = `UPDATE Form_List SET Apperance='${formPosition5}' WHERE ID=(SELECT ID WHERE Name='${formName5}')`;
  let query5 = db.query(sql5, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql6 = `UPDATE Form_List SET Apperance='${formPosition6}' WHERE ID=(SELECT ID WHERE Name='${formName6}')`;
  let query6 = db.query(sql6, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql7 = `UPDATE Form_List SET Apperance='${formPosition7}' WHERE ID=(SELECT ID WHERE Name='${formName7}')`;
  let query7 = db.query(sql7, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql8 = `UPDATE Form_List SET Apperance='${formPosition8}' WHERE ID=(SELECT ID WHERE Name='${formName8}')`;
  let query8 = db.query(sql8, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql9 = `UPDATE Form_List SET Apperance='${formPosition9}' WHERE ID=(SELECT ID WHERE Name='${formName9}')`;
  let query9 = db.query(sql9, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql10 = `UPDATE Form_List SET Apperance='${formPosition10}' WHERE ID=(SELECT ID WHERE Name='${formName10}')`;
  let query10 = db.query(sql10, (err, result) => {
    if (err) {
      throw err;
    }
    res.send('<script>alert("Form order updated"); window.location.href = "/admin_list_return"; </script>');
  });


});

app.post("/newForm", (req, res) => {
  qOnecontent = req.body.qType1

  let data2 = {
    ID: 0, Name: req.body.formName, Author: "example", Creation: "2-14-22", apperance: "5"
  };
  let data1 = {
    ID: 0, Qone_type: qOnecontent, Qone_content: req.body.input1, Form_List_ID: "1", Q_apperance: "1"
  };
  let data3 = {
    ID: 0, Qone_type: req.body.qType2, Qone_content: req.body.input2, Form_List_ID: "1", Q_apperance: "2"
  };

  let sql = `INSERT INTO Form_List SET ?`;
  let query = db.query(sql, data2, (err, result) => {
    if (err) {
      throw err;
    }

  });
  let sql1 = `INSERT INTO Form_Questions SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
  });

  let sql3 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}')) WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType1}' AND Qone_content='${req.body.input1}')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }

  });
  let sql4 = `UPDATE Form_List SET Apperance=(SELECT Form_List_ID FROM Form_Questions WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType1}' AND Qone_content='${req.body.input1}')) WHERE ID=(SELECT ID WHERE Name='${req.body.formName}')`;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }

  });
  if (data3.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data3, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}')) WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType2}' AND Qone_content='${req.body.input2}')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }

    });
  } else {
    res.send('<script>alert("New form created"); window.location.href = "/home_return"; </script>');
  }
});

app.post("/dynamicQOne", (req, res) => {
  let data1 = {
    ID: 0, Answer: req.body.qAnswer, Form_Questions_ID: 1, Form_Questions_Form_List_ID: 2, Patient_Info_ID: 2
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
    res.send('<script>alert("Question one answer recorded"); window.location.href = "/qTwo_render"; </script>');
  });
});

app.post("/dynamicQTwo", (req, res) => {
  let data1 = {
    ID: 0, Answer: req.body.qAnswer, Form_Questions_ID: 2, Form_Questions_Form_List_ID: 2
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
    res.send('<script>alert("Question two answer recorded"); window.location.href = "/admin_list_return"; </script>');
  });
});

app.post("/qOne", (req, res) => {
  let data1 = {
    ID: 0, Fname: req.body.fname, Lname: req.body.lname, Email: "placeholder@domain.com",
    Street: "placeholder", AptFloorSuite: "", City: "Placeholder", State: "MI", Zip: "12345", Phone: "123-456-7891",
    Pref_contact: "Text"
  };
  let sql1 = `INSERT INTO Patient_Info SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
    res.send('<script>alert("patient added to system"); window.location.href = "/qOneNext_render"; </script>');
  });
});

// Setup server ports
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

