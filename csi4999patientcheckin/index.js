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

      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance="2") AND Q_apperance="1"`;
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
  let sql2 = `SELECT * Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
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
  let sql2 = `SELECT * FROM Employee_Info WHERE Employee_Info.Username='${req.body.username}'`;
  let sql3 = `UPDATE Employee_Info SET LogLim += 1 WHERE ID(SELECT ID WHERE Username='${req.body.username}')`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] == undefined) {
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0]!=undefined){
          db.query(sql3, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0].LogLim == 4){
              res.send('<script>alert("Account locked contact your administrator."); window.location.href = "/login_return"; </script>');
            }
            res.send('<script>alert("Invalid Password"); window.location.href = "/login_return"; </script>');
          });
        }
        else {res.send('<script>alert("Username does not exist."); window.location.href = "/login_return"; </script>');}
      });
    }
    else if (result[0].Role == "Nurse") {
      if (result[0].LogLim == 4){
        res.send('<script>alert("Account locked contact your administrator."); window.location.href = "/login_return"; </script>');
      }
      else if (result[0].FPass == "Y") {
        res.render("expiredPassReset", { data: result });
      } else {
        res.render("nursePage", { data: result });
      }
    }
    else if (result[0].Role == "Doctor") {
      if (result[0].LogLim == 4){
        res.send('<script>alert("Account locked contact your administrator."); window.location.href = "/login_return"; </script>');
      }
      else if (result[0].FPass == "Y") {
        res.render("expiredPassReset", { data: result });
      } else {
        res.render("doctorPage", { data: result });
      }
    }
    else if (result[0].Role == "Admin") {
      if (result[0].LogLim == 4){
        res.send('<script>alert("Account locked contact your administrator."); window.location.href = "/login_return"; </script>');
      }
      else if (result[0].FPass == "Y") {
        res.render("expiredPassReset", { data: result });
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
              let sql = `SELECT * FROM Employee_Info WHERE Username='${req.body.username}'`;
              db.query(sql, (err, result) => {
                if (err) {
                  throw err;
                }
                if (result[0].Role == "Nurse") {

                  res.send('<script>alert("Password reset"); window.location.href = "/nurse_return"; </script>');
                }

                else if (result[0].Role == "Doctor") {

                  res.send('<script>alert("Password reset"); window.location.href = "/doctor_return"; </script>');
                }

                else if (result[0].Role == "Admin") {
                  res.send('<script>alert("Password reset"); window.location.href = "/admin_list_return"; </script>');

                }

              });


            }
          });
        }
      });
    }
  });
});

app.post("/formChanges", (req, res) => {
  var formName01 = req.body.form1
  var formName1
  var formName02 = req.body.form2
  var formName2
  formName03 = req.body.form3
  var formName3
  formName04 = req.body.form4
  var formName4
  formName05 = req.body.form5
  var formName5
  formName06 = req.body.form6
  var formName6
  formName07 = req.body.form7
  var formName7
  formName08 = req.body.form8
  var formName8
  formName09 = req.body.form9
  var formName9
  formName010 = req.body.form10
  var formName10
  formName011 = req.body.form11
  var formName11
  formName012 = req.body.form12
  var formName12
  formName013 = req.body.form13
  var formName13
  formName014 = req.body.form14
  var formName14
  formName015 = req.body.form15
  var formName15
  formName016 = req.body.form16
  var formName16
  formName017 = req.body.form17
  var formName17
  formName018 = req.body.form18
  var formName18
  formName019 = req.body.form19
  var formName19
  formName020 = req.body.form20
  var formName20
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
  formPosition11 = req.body.Position11
  formPosition12 = req.body.Position12
  formPosition13 = req.body.Position13
  formPosition14 = req.body.Position14
  formPosition15 = req.body.Position15
  formPosition16 = req.body.Position16
  formPosition17 = req.body.Position17
  formPosition18 = req.body.Position18
  formPosition19 = req.body.Position19
  formPosition20 = req.body.Position20

  let submitName1 = JSON.stringify(formName01);
  let submitName2 = JSON.stringify(formName02);
  let submitName3 = JSON.stringify(formName03);
  let submitName4 = JSON.stringify(formName04);
  let submitName5 = JSON.stringify(formName05);
  let submitName6 = JSON.stringify(formName06);
  let submitName7 = JSON.stringify(formName07);
  let submitName8 = JSON.stringify(formName08);
  let submitName9 = JSON.stringify(formName09);
  let submitName10 = JSON.stringify(formName010);
  let submitName11 = JSON.stringify(formName011);
  let submitName12 = JSON.stringify(formName012);
  let submitName13 = JSON.stringify(formName013);
  let submitName14 = JSON.stringify(formName014);
  let submitName15 = JSON.stringify(formName015);
  let submitName16 = JSON.stringify(formName016);
  let submitName17 = JSON.stringify(formName017);
  let submitName18 = JSON.stringify(formName018);
  let submitName19 = JSON.stringify(formName019);
  let submitName20 = JSON.stringify(formName020);
  let submission = JSON.stringify(req.body);

  if (submitName2 != undefined) {
    splits00002 = submitName2.split('Edit ')[1]
    splits2 = splits00002.split(' Form')[0]
    formName2 = splits2
  }
  if (submitName3 != undefined) {
    let splits00002 = submitName3.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName3 = splits2
  }
  if (submitName4 != undefined) {
    let splits00002 = submitName4.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName4 = splits2
  }
  if (submitName5 != undefined) {
    let splits00002 = submitName5.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName5 = splits2
  }
  if (submitName6 != undefined) {
    let splits00002 = submitName6.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName6 = splits2
  }
  if (submitName7 != undefined) {
    let splits00002 = submitName7.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName7 = splits2
  }
  if (submitName8 != undefined) {
    let splits00002 = submitName8.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName8 = splits2
  }
  if (submitName9 != undefined) {
    let splits00002 = submitName9.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName9 = splits2
  }
  if (submitName10 != undefined) {
    let splits00002 = submitName10.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName10 = splits2
  }
  if (submitName11 != undefined) {
    let splits00002 = submitName11.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName11 = splits2
  }
  if (submitName12 != undefined) {
    let splits00002 = submitName12.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName12 = splits2
  }
  if (submitName13 != undefined) {
    let splits00002 = submitName13.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName13 = splits2
  }
  if (submitName14 != undefined) {
    let splits00002 = submitName14.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName14 = splits2
  }
  if (submitName15 != undefined) {
    let splits00002 = submitName15.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName15 = splits2
  }
  if (submitName16 != undefined) {
    let splits00002 = submitName16.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName16 = splits2
  }
  if (submitName17 != undefined) {
    let splits00002 = submitName17.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName17 = splits2
  }
  if (submitName18 != undefined) {
    let splits00002 = submitName18.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName18 = splits2
  }
  if (submitName19 != undefined) {
    let splits00002 = submitName19.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName19 = splits2
  }
  if (submitName20 != undefined) {
    let splits00002 = submitName20.split('Edit ')[1]
    let splits2 = splits00002.split(' Form')[0]
    formName20 = splits2
  }


  if (submitName1 != undefined) {
    if (submitName1.includes("form1") == true) {
      let splits001 = submitName1.split(']')[0]
      let splits01 = splits001.split(',')[1]
      let splits0001 = submitName1.split('"')[1]
      let splits1 = splits0001.split('m')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID= '${splits1}'`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID='${splits1}'`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName2 != undefined) {
    if (submitName2.includes("form2") == true) {
      let splits002 = submitName2.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName3 != undefined) {
    if (submitName3.includes("form3") == true) {
      let splits002 = submitName3.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName4 != undefined) {
    if (submitName4.includes("form4") == true) {
      let splits002 = submitName4.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName5 != undefined) {
    if (submitName5.includes("form5") == true) {
      let splits002 = submitName5.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName6 != undefined) {
    if (submitName6.includes("form6") == true) {
      let splits002 = submitName6.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName7 != undefined) {
    if (submitName7.includes("form7") == true) {
      let splits002 = submitName7.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName8 != undefined) {
    if (submitName8.includes("form8") == true) {
      let splits002 = submitName8.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName9 != undefined) {
    if (submitName9.includes("form9") == true) {
      let splits002 = submitName9.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName10 != undefined) {
    if (submitName10.includes("form10") == true) {
      let splits002 = submitName10.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName11 != undefined) {
    if (submitName11.includes("form11") == true) {
      let splits002 = submitName11.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName12 != undefined) {
    if (submitName12.includes("form12") == true) {
      let splits002 = submitName12.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName13 != undefined) {
    if (submitName13.includes("form13") == true) {
      let splits002 = submitName13.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName14 != undefined) {
    if (submitName14.includes("form14") == true) {
      let splits002 = submitName14.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName15 != undefined) {
    if (submitName15.includes("form15") == true) {
      let splits002 = submitName15.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName16 != undefined) {
    if (submitName16.includes("form16") == true) {
      let splits002 = submitName16.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName17 != undefined) {
    if (submitName17.includes("form17") == true) {
      let splits002 = submitName17.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName18 != undefined) {
    if (submitName18.includes("form18") == true) {
      let splits002 = submitName18.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName19 != undefined) {
    if (submitName19.includes("form19") == true) {
      let splits002 = submitName19.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }
  if (submitName20 != undefined) {
    if (submitName20.includes("form20") == true) {
      let splits002 = submitName20.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('Edit ')[1]
      let splits2 = splits00002.split(' Form')[0]

      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits2}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits2}')`;
      let query1 = db.query(sql1, (err, result) => {
        if (err) {
          throw err;
        }
        var result1 = result;
        let query2 = db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          res.render("formInfo", { data: result1, questions: result2 });
        });
      });
    }
  }

  if (submission.includes("Submit") == true) {

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
    });
    let sql11 = `UPDATE Form_List SET Apperance='${formPosition11}' WHERE ID=(SELECT ID WHERE Name='${formName11}')`;
    let query11 = db.query(sql11, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql12 = `UPDATE Form_List SET Apperance='${formPosition12}' WHERE ID=(SELECT ID WHERE Name='${formName12}')`;
    let query12 = db.query(sql12, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql13 = `UPDATE Form_List SET Apperance='${formPosition13}' WHERE ID=(SELECT ID WHERE Name='${formName13}')`;
    let query13 = db.query(sql13, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql14 = `UPDATE Form_List SET Apperance='${formPosition14}' WHERE ID=(SELECT ID WHERE Name='${formName14}')`;
    let query14 = db.query(sql14, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql15 = `UPDATE Form_List SET Apperance='${formPosition15}' WHERE ID=(SELECT ID WHERE Name='${formName15}')`;
    let query15 = db.query(sql15, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql16 = `UPDATE Form_List SET Apperance='${formPosition16}' WHERE ID=(SELECT ID WHERE Name='${formName16}')`;
    let query16 = db.query(sql16, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql17 = `UPDATE Form_List SET Apperance='${formPosition17}' WHERE ID=(SELECT ID WHERE Name='${formName17}')`;
    let query17 = db.query(sql17, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql18 = `UPDATE Form_List SET Apperance='${formPosition18}' WHERE ID=(SELECT ID WHERE Name='${formName18}')`;
    let query18 = db.query(sql18, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql19 = `UPDATE Form_List SET Apperance='${formPosition19}' WHERE ID=(SELECT ID WHERE Name='${formName19}')`;
    let query19 = db.query(sql19, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let sql20 = `UPDATE Form_List SET Apperance='${formPosition20}' WHERE ID=(SELECT ID WHERE Name='${formName20}')`;
    let query20 = db.query(sql20, (err, result) => {
      if (err) {
        throw err;
      }
      res.send('<script>alert("Form order updated"); window.location.href = "/admin_list_return"; </script>');
    });
  }
});



app.post("/newForm", (req, res) => {
  date = req.body.date

  let data = {
    ID: 0, Name: req.body.formName, Author: req.body.formCreator, Creation: date, apperance: "100", Metadata: req.body.formMeta, Use: req.body.formUse
  };


  let sql2 = `INSERT INTO Form_List SET ?`;
  let query = db.query(sql2, data, (err, result) => {
    if (err) {
      throw err;
    }
    res.send('<script>alert("New Form Created"); window.location.href = "/admin_list_return"; </script>');
  });
  let sql4 = `UPDATE Form_List SET Apperance=ID WHERE ID=(SELECT ID WHERE Name='${req.body.formName}' AND Apperance ='100' AND Creation='${req.body.date}')`;
  let sql1000 = `UPDATE Form_List SET Apperance=(SELECT ID FROM Form_Questions WHERE ID IN (SELECT ID WHERE Qone_type ='${req.body.qType1}' AND Qone_content = '${req.body.input1}' AND Q_apperance ='1')) WHERE ID=(SELECT ID WHERE Name='${req.body.formName}' AND Apperance='100') `;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }

  });
});





app.post("/dynamicQTwo", (req, res) => {
  let date = req.body.date
  let data1 = {
    ID: 0, Answer: req.body.qAnswer, Form_Questions_ID: 1, Patient_Info_ID: 1
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql2 = `UPDATE Form_Answers SET Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') WHERE ID=(SELECT ID WHERE Answer='${req.body.qAnswer}' AND Form_Questions_ID="1")`;
  let query2 = db.query(sql2, (err, result) => {
    if (err) {
      throw err;
    }
  });

  let sql3 = `UPDATE Form_Answers SET Form_Questions_ID='${req.body.id}' WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') AND Answer='${req.body.qAnswer}' AND '${req.body.id}'=(SELECT ID FROM Form_Questions WHERE Qone_content='${req.body.question}' AND Date='${date}')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }

    let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="2"`;
    let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] == undefined) {
        res.send('<script>alert("Patient added to system, no third form loaded"); window.location.href = "/home_return"; </script>');
      } else {
        var result1 = result;
        db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;

          res.render("dynamicQ1", { data: result1, user: result2 });

        });
      }
    });
  });
});

app.post("/dynamicQTwoold", (req, res) => {
  let data1 = {
    ID: 0, Answer: req.body.qAnswer, Form_Questions_ID: 1, Patient_Info_ID: 1
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql2 = `UPDATE Form_Answers SET Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') WHERE ID=(SELECT ID WHERE Answer='${req.body.qAnswer}' AND Form_Questions_ID="1")`;
  let query2 = db.query(sql2, (err, result) => {
    if (err) {
      throw err;
    }
  });

  let sql3 = `UPDATE Form_Answers SET Form_Questions_ID='${req.body.id}' WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') AND Answer='${req.body.qAnswer}'`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }
  });
});

app.post("/qOne", (req, res) => {
  if (req.body.previous == "no") {
    let data1 = {
      ID: 0, Fname: req.body.fname, Lname: req.body.lname, Email: "placeholder@domain.com",
      Street: "placeholder", AptFloorSuite: "", City: "Placeholder", State: "MI", Zip: "12345", Phone: "123-456-7891",
      Pref_contact: "Text"
    };
    let sql0 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
    let query0 = db.query(sql0, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] != undefined) {
        res.send('<script>alert("Patient exists in system. Please select yes for previous user prompt"); window.location.href = "/home_return"; </script>');
      } else {
        let sql1 = `INSERT INTO Patient_Info SET ?`;
        let query1 = db.query(sql1, data1, (err, result) => {
          if (err) {
            throw err;
          }
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("Patient added to system, no second form loaded"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                if(result1[0].RadioSix != undefined){
                  res.render("dynamicSixRadio", { data: result1, user: result2 });
                }else if(result1[0].Radiofive != undefined){
                  res.render("dynamicFiveRadio", { data: result1, user: result2 });
                }else if(result1[0].Radiofour != undefined){
                  res.render("dynamicFourRadio", { data: result1, user: result2 });
                }
                 else if(result1[0].Radiothree != undefined){
                  res.render("dynamicThreeRadio", { data: result1, user: result2 });
                }   else if(result1[0].Radioone != undefined){
                  res.render("dynamicTwoRadio", { data: result1, user: result2 });
                }
                else{
                res.render("dynamicQ1", { data: result1, user: result2 });
              }
              });            
            }
          });
        });
      }
    });
  }
  else { let sql0 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
  let query0 = db.query(sql0, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] == undefined) {
      res.send('<script>alert("Patient does not exist in system. Please select no for previous user prompt"); window.location.href = "/home_return"; </script>');
    } else {
    let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="1"`;
    let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] == undefined) {
        res.send('<script>alert("Patient added to system, no second form loaded"); window.location.href = "/home_return"; </script>');
      } else {
        var result1 = result;
        db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;
          if(result1[0].RadioSix != undefined){
            res.render("dynamicSixRadio", { data: result1, user: result2 });
          }else if(result1[0].Radiofive != undefined){
            res.render("dynamicFiveRadio", { data: result1, user: result2 });
          }else if(result1[0].Radiofour != undefined){
            res.render("dynamicFourRadio", { data: result1, user: result2 });
          }
           else if(result1[0].Radiothree != undefined){
            res.render("dynamicThreeRadio", { data: result1, user: result2 });
          }   else if(result1[0].Radioone != undefined){
            res.render("dynamicTwoRadio", { data: result1, user: result2 });
          }
          else{
          res.render("dynamicQ1", { data: result1, user: result2 });
        }
     
        });
      }
    });
      }
    
    });
    
  }
});



app.post("/patientAnsweredForms", (req, res) => {
  let sql2 = `SELECT * FROM Patient_Info WHERE ID='${req.body.id}'`;
  let sql = `SELECT * FROM Form_List WHERE ID IN (SELECT Form_List_ID FROM Form_Questions WHERE ID IN (SELECT Form_Questions_ID FROM Form_Answers WHERE Patient_Info_ID = '${req.body.id}'))`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    var result1 = result;
    db.query(sql2, (err, result) => {
      if (err) {
        throw err;
      }
    res.render("patientAnsweredForms", {form: result1, user: result});
  });
});
});

app.post("/patientAnswers", (req, res) => {
  let formName= req.body.Form2
  let submitName1 = JSON.stringify(formName);
  let splits002 = submitName1.split(']')[0]
      let splits02 = splits002.split(',')[1]
      let splits0002 = splits02.split('"')[1]
      let splits00002 = splits0002.split('View ')[1]
      let splits2 = splits00002.split(' Responses')[0]
  let sql = `SELECT * FROM Form_Answers WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE ID='${req.body.name}')`;
  let sql2 = `SELECT * FROM Patient_Info WHERE ID='${req.body.name}'`;
  let sql3 = `SELECT * FROM Form_List WHERE Name ='${splits2}'`;
  let sql4 = `SELECT * FROM Form_Questions WHERE ID IN (SELECT Form_Questions_ID FROM Form_Answers WHERE Patient_Info_ID = ('${req.body.name}'))`;
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
      db.query(sql3, (err, result) => {
        if (err) {
          throw err;
        }
        var result3 = result;
        db.query(sql4, (err, result) => {
          if (err) {
            throw err;
          }
          var result4 = result;
          res.render("patientAnswers", { data: result1, user: result2, form: result3, question: result4 });
        });
      });
    });
  });
});
app.post("/patientAnswersOLD", (req, res) => {
  let sql = `SELECT * FROM Form_Answers WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE ID='${req.body.id}')`;
  let sql2 = `SELECT * FROM Patient_Info WHERE ID='${req.body.id}'`;
  let sql3 = `SELECT * FROM Form_List WHERE ID IN (SELECT Form_List_ID FROM Form_Questions WHERE ID IN (SELECT Form_Questions_ID FROM Form_Answers WHERE Patient_Info_ID = '${req.body.id}'))`;
  let sql4 = `SELECT * FROM Form_Questions WHERE ID IN (SELECT Form_Questions_ID FROM Form_Answers WHERE Patient_Info_ID = ('${req.body.id}'))`;
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
      db.query(sql3, (err, result) => {
        if (err) {
          throw err;
        }
        var result3 = result;
        db.query(sql4, (err, result) => {
          if (err) {
            throw err;
          }
          var result4 = result;
          res.render("patientAnswers", { data: result1, user: result2, form: result3, question: result4 });
        });
      });
    });
  });
});

app.post("/dynamicQOneOLD", (req, res) => {
  let date = req.body.date
  let apperance = req.body.apperance
  let data1 = {
    ID: 0, Answer: req.body.qAnswer, Form_Questions_ID: 1, Patient_Info_ID: 1
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql2 = `UPDATE Form_Answers SET Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') WHERE ID=(SELECT ID WHERE Answer='${req.body.qAnswer}' AND Form_Questions_ID="1")`;
  let query2 = db.query(sql2, (err, result) => {
    if (err) {
      throw err;
    }
  });

  let sql3 = `UPDATE Form_Answers SET Form_Questions_ID='${req.body.id}' WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') AND Answer='${req.body.qAnswer}' AND '${req.body.id}'=(SELECT ID FROM Form_Questions WHERE Qone_content='${req.body.question}' AND Date='${date}')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }

    let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
    let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] == undefined) {
        res.send('<script>alert("question response recorded, no third form loaded"); window.location.href = "/home_return"; </script>');
      } else {
        var result1 = result;
        db.query(sql2, (err, result) => {
          if (err) {
            throw err;
          }
          var result2 = result;

          res.render("dynamicQ2", { data: result1, user: result2 });
        });
      }
    });
  });
});


















app.post("/dynamicQOne", (req, res) => {
  let response= req.body.qAnswer;
  let date = req.body.date
  let apperance = req.body.apperance
  let apperance2 = JSON.stringify(apperance);
  let listID = req.body.list
  let listID2 = JSON.stringify(listID);
  let data1 = {
    ID: 0, Answer: response, Form_Questions_ID: 1, Patient_Info_ID: 1 
  };
  let sql1 = `INSERT INTO Form_Answers SET ?`;
  let query1 = db.query(sql1, data1, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql2 = `UPDATE Form_Answers SET Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') WHERE ID=(SELECT ID WHERE Answer='${req.body.qAnswer}' AND Form_Questions_ID="1")`;
  let query2 = db.query(sql2, (err, result) => {
    if (err) {
      throw err;
    }
  });

  let sql3 = `UPDATE Form_Answers SET Form_Questions_ID='${req.body.id}' WHERE Patient_Info_ID=(SELECT ID FROM Patient_Info WHERE Fname= '${req.body.fname}'AND Lname='${req.body.lname}') AND Answer='${req.body.qAnswer}' AND '${req.body.id}'=(SELECT ID FROM Form_Questions WHERE Qone_content='${req.body.question}' AND Date='${date}')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }
  });
  let sql4 = `SELECT Apperance FROM Form_List WHERE ID ='${req.body.list}'`;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }
    let listApperance = result[0].Apperance;

    if (listApperance == "2" && apperance == "1") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="2"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "2") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="3"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "3") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="4"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "4") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="5"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "5") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="6"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "6") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="7"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "7") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="8"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "8") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="9"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "9") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="10"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "10") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="11"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "11") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="12"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "12") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="13"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "13") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="14"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "14") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="15"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "15") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="16"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "16") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="17"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "17") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="18"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "18") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="19"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "19") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="20"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "2" && apperance == "20") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "23") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="24"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "24") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="25"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "25") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="26"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "26") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="27"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "27") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="28"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "28") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="29"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "29") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="30"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "30") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="31"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "31") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="32"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "32") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="33"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "33") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="34"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "34") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="35"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "35") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="36"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "36") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="37"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "37") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="38"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "38") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="39"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "39") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="40"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "40") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="41"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "41") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="42"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "42") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="43"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "43") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="44"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "45") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="46"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "46") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="47"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "47") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="48"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "49") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="50"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "50") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="51"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "2" && apperance == "51") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='2') AND Q_apperance="52"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } 
    else if (listApperance == "3" && apperance == "1") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="2"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "2") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="3"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "3") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="4"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "4") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="5"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "5") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="6"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "6") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="7"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "7") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="8"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "8") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="9"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "9") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="10"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "10") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="11"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "11") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="12"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "12") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="13"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "13") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="14"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "14") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="15"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "15") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="16"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "16") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="17"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "17") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="18"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "18") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="19"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "19") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="20"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "20") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="21"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "3" && apperance == "21") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="22"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "22") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="23"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "23") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="24"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "24") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="25"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "25") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="26"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "26") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="27"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "27") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="28"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "28") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="29"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "29") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="30"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "30") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="31"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "31") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="32"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "32") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="33"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "33") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="34"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "34") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="35"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "35") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="36"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "36") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="37"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "37") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="38"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "38") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="39"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "39") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="40"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "40") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="41"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "41") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="42"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "42") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="43"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "43") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="44"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "44") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="45"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "45") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="46"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "46") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="47"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "47") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="48"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "48") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="49"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "49") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="50"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }else if (listApperance == "3" && apperance == "50") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="51"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "3" && apperance == "51") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="52"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    else if (listApperance == "4" && apperance == "1") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="2"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "2") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="3"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "3") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="4"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "4") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="5"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "5") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="6"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "6") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="7"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "7") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="8"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "8") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="9"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "9") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="10"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "10") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="11"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "11") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="12"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "12") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="13"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "13") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="14"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "14") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="15"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "15") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="16"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "16") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="17"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "17") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="18"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "18") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="19"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "19") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="20"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    } else if (listApperance == "4" && apperance == "20") {
      let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='4') AND Q_apperance="1"`;
      let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
      db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        if (result[0] == undefined) {
          let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='5') AND Q_apperance="1"`;
          let sql2 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
          db.query(sql, (err, result) => {
            if (err) {
              throw err;
            }
            if (result[0] == undefined) {
              res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
            } else {
              var result1 = result;
              db.query(sql2, (err, result) => {
                if (err) {
                  throw err;
                }
                var result2 = result;
                res.render("dynamicQ1", { data: result1, user: result2 });
              });
            }
          });
        } else {
          var result1 = result;
          db.query(sql2, (err, result) => {
            if (err) {
              throw err;
            }
            var result2 = result;
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    }
    let sql9 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
    let sql8 = `SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;

  });
});

app.post("/formInfoChanges", (req, res) => {
  let name = req.body.author;
  let author = req.body.author;
  let submission = JSON.stringify(req.body);
  let id = req.body.name;
  if (submission.includes("Add Questions") == true) {
    let sql1 = `SELECT * FROM Form_List WHERE ID='${id}'`;
    let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID='${id}' AND Q_apperance='1'`;
    db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
      var result1 = result;
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        var result2 = result;
        if (result2[0] == undefined) {
          res.render("addQuestionNew", { form: result1 });
        }
        else {
          res.render("addQuestion", { form: result1, questions: result2 });
        }
      });
    });

  }

});

app.post("/addQuestion", (req, res) => {
  let rad1=req.body.radioOne;
  let rad2=req.body.radioTwo;
  let rad3=req.body.radioThree;
  let rad4=req.body.radioFour;
  let rad5=req.body.radioFive;
  let rad6=req.body.radioSix;
  
  let id = req.body.name;
  let qNum = req.body.qCurrent;
  let curQ = parseInt(qNum);
  let nextQ = curQ + 1;
  let submission = JSON.stringify(req.body);
  let data = {
    ID: 0, Qone_type: req.body.qType, Qone_content: req.body.qContent, Q_apperance: req.body.qNumber, Form_List_ID: id,
    Date: req.body.date, Radioone: rad1, Radiotwo: rad2,
    Radiothree: rad3, Radiofour: rad4, Radiofive: rad5, RadioSix: rad5, imageUpload: req.body.imagePrompt,
  };
  let sql1 = `SELECT * FROM Form_List WHERE ID='${id}'`;
  let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID='${id}' AND Q_apperance='${nextQ}'`;
  let sql3 = `INSERT INTO Form_Questions SET ?`;
  let sql4 = `SELECT * FROM Form_Questions WHERE Form_List_ID='${id}' AND Q_apperance='${req.body.qNumber}'`;
  let sql5 = `SELECT * FROM Form_Questions WHERE Form_List_ID='${id}' AND Q_apperance='${req.body.qNumber}' AND Date='${req.body.date}'`;

  if (submission.includes("Next Question") == true) {
    db.query(sql5, (err, result) => {
      if (err) {
        throw err;
      }
      if (result[0] != undefined) {
        let sql8 = `DELETE FROM Form_Questions WHERE ID=(SELECT ID WHERE Q_apperance='${req.body.qNumber}' AND Form_List_ID='${id}' AND Qone_content='${req.body.qContent}')`;
        let sql9 = `UPDATE Form_Questions SET Q_apperance ='${nextQ}' WHERE ID =(SELECT ID WHERE Form_List_ID='${id}' AND Date='${req.body.date}' AND Q_apperance='NaN')`;
        let sql7 = `UPDATE Form_Questions SET Qone_content ='${req.body.qContent}' WHERE ID =(SELECT ID WHERE Form_List_ID='${id}' AND Date='${req.body.date}' AND Q_apperance='${req.body.qNumber}')`;

        db.query(sql7, (err, result) => {
          if (err) {
            throw err;
          }
        });


      }
      else {
        db.query(sql4, (err, result) => {
          if (err) {
            throw err;
          }
          if (result[0] != undefined) {
            let sql6 = `UPDATE Form_Questions SET Q_apperance ='${nextQ}' WHERE ID =(SELECT ID WHERE Form_List_ID='${id}' AND Q_apperance='${req.body.qNumber}')`;
            db.query(sql6, (err, result) => {
              if (err) {
                throw err;
              }
              db.query(sql3, data, (err, result) => {
                if (err) {
                  throw err;
                }

              });
            });
          } else {
            db.query(sql3, data, (err, result) => {
              if (err) {
                throw err;
              }

            });
          }
        });
      }
    });



    db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
      var result1 = result;
      db.query(sql2, (err, result) => {
        if (err) {
          throw err;
        }
        var result2 = result;
        if (result2[0] == undefined) {
          res.render("addQuestionNew", { form: result1 });
        }
        else {
          res.render("addQuestion", { form: result1, questions: result2 });
        }
      });
    });


  } else {
    res.render("adminTerminal");
  }

});

// Setup server ports
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));




