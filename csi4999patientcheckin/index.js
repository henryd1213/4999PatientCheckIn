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
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result[0] == undefined) {
      res.send('<script>alert("Invalid Username or Password"); window.location.href = "/login_return"; </script>');
    }
    else if (result[0].Role == "Nurse") {
      if (result[0].FPass == "Y") {
        res.render("expiredPassReset", { data: result });
      } else {
        res.render("nursePage", { data: result });
      }
    }
    else if (result[0].Role == "Doctor") {
      if (result[0].FPass == "Y") {
        res.render("expiredPassReset", { data: result });
      } else {
        res.render("doctorPage", { data: result });
      }
    }
    else if (result[0].Role == "Admin") {
      if (result[0].FPass == "Y") {
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
  formName11 = req.body.form11
  formName12 = req.body.form12
  formName13 = req.body.form13
  formName14 = req.body.form14
  formName15 = req.body.form15
  formName16 = req.body.form16
  formName17 = req.body.form17
  formName18 = req.body.form18
  formName19 = req.body.form19
  formName20 = req.body.form20
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

  let submitName1 = JSON.stringify(formName1);
  let submitName2 = JSON.stringify(formName2);
  let submitName3 = JSON.stringify(formName3);
  let submitName4 = JSON.stringify(formName4);
  let submitName5 = JSON.stringify(formName5);
  let submitName6 = JSON.stringify(formName6);
  let submitName7 = JSON.stringify(formName7);
  let submitName8 = JSON.stringify(formName8);
  let submitName9 = JSON.stringify(formName9);
  let submitName10 = JSON.stringify(formName10);
  let submitName11 = JSON.stringify(formName11);
  let submitName12 = JSON.stringify(formName12);
  let submitName13 = JSON.stringify(formName13);
  let submitName14 = JSON.stringify(formName14);
  let submitName15 = JSON.stringify(formName15);
  let submitName16 = JSON.stringify(formName16);
  let submitName17 = JSON.stringify(formName17);
  let submitName18 = JSON.stringify(formName18);
  let submitName19 = JSON.stringify(formName19);
  let submitName20 = JSON.stringify(formName20);
  let submission = JSON.stringify(req.body);

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
      let splits2 = splits02.split('"')[1]
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
      let splits003 = submitName3.split(']')[0]
      let splits03 = splits003.split(',')[1]
      let splits3 = splits03.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits3}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits3}')`;
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
      let splits004 = submitName4.split(']')[0]
      let splits04 = splits004.split(',')[1]
      let splits4 = splits04.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits4}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits4}')`;
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
      let splits005 = submitName5.split(']')[0]
      let splits05 = splits005.split(',')[1]
      let splits5 = splits05.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits5}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits5}')`;
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
      let splits006 = submitName6.split(']')[0]
      let splits06 = splits006.split(',')[1]
      let splits6 = splits06.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits6}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits6}')`;
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
      let splits007 = submitName7.split(']')[0]
      let splits07 = splits007.split(',')[1]
      let splits7 = splits07.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits7}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits7}')`;
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
      let splits008 = submitName8.split(']')[0]
      let splits08 = splits008.split(',')[1]
      let splits8 = splits08.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits8}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits8}')`;
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
      let splits009 = submitName9.split(']')[0]
      let splits09 = splits009.split(',')[1]
      let splits9 = splits09.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits9}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits9}')`;
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
      let splits0010 = submitName10.split(']')[0]
      let splits010 = splits0010.split(',')[1]
      let splits10 = splits010.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits10}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits10}')`;
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
      let splits0011 = submitName11.split(']')[0]
      let splits011 = splits0011.split(',')[1]
      let splits11 = splits011.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits11}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits11}')`;
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
      let splits0012 = submitName12.split(']')[0]
      let splits012 = splits0012.split(',')[1]
      let splits12 = splits012.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits12}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits12}')`;
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
      let splits0013 = submitName13.split(']')[0]
      let splits013 = splits0013.split(',')[1]
      let splits13 = splits013.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits13}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits13}')`;
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
      let splits0014 = submitName14.split(']')[0]
      let splits014 = splits0014.split(',')[1]
      let splits14 = splits014.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits14}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits14}')`;
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
      let splits0015 = submitName15.split(']')[0]
      let splits015 = splits0015.split(',')[1]
      let splits15 = splits015.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits15}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits15}')`;
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
      let splits0016 = submitName16.split(']')[0]
      let splits016 = splits0016.split(',')[1]
      let splits16 = splits016.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits16}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits16}')`;
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
      let splits0017 = submitName17.split(']')[0]
      let splits017 = splits0017.split(',')[1]
      let splits17 = splits017.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits17}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits17}')`;
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
      let splits0018 = submitName18.split(']')[0]
      let splits018 = splits0018.split(',')[1]
      let splits18 = splits018.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits18}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits18}')`;
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
      let splits0019 = submitName19.split(']')[0]
      let splits019 = splits0019.split(',')[1]
      let splits19 = splits019.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits19}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits19}')`;
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
      let splits0020 = submitName20.split(']')[0]
      let splits020 = splits0020.split(',')[1]
      let splits20 = splits020.split('"')[1]
      let sql1 = `SELECT * FROM Form_List WHERE ID=(SELECT ID WHERE Name = '${splits20}')`;
      let sql2 = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Name = '${splits20}')`;
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

  if (submission.includes("submit") == true) {

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
  qOnecontent = req.body.qType1
  date = req.body.date

  let data = {
    ID: 0, Name: req.body.formName, Author: "example", Creation: date, apperance: "100"
  };
  let data1 = {
    ID: 0, Qone_type: qOnecontent, Qone_content: req.body.input1, Form_List_ID: "1", Q_apperance: "1", date
  };
  let data2 = {
    ID: 0, Qone_type: req.body.qType2, Qone_content: req.body.input2, Form_List_ID: "1", Q_apperance: "2", date
  };
  let data3 = {
    ID: 0, Qone_type: req.body.qType3, Qone_content: req.body.input3, Form_List_ID: "1", Q_apperance: "3", date
  };
  let data4 = {
    ID: 0, Qone_type: req.body.qType4, Qone_content: req.body.input4, Form_List_ID: "1", Q_apperance: "4", date
  };
  let data5 = {
    ID: 0, Qone_type: req.body.qType5, Qone_content: req.body.input5, Form_List_ID: "1", Q_apperance: "5", date
  };
  let data6 = {
    ID: 0, Qone_type: req.body.qType6, Qone_content: req.body.input6, Form_List_ID: "1", Q_apperance: "6", date
  };
  let data7 = {
    ID: 0, Qone_type: req.body.qType7, Qone_content: req.body.input7, Form_List_ID: "1", Q_apperance: "7", date
  };
  let data8 = {
    ID: 0, Qone_type: req.body.qType8, Qone_content: req.body.input8, Form_List_ID: "1", Q_apperance: "8", date
  };
  let data9 = {
    ID: 0, Qone_type: req.body.qType9, Qone_content: req.body.input9, Form_List_ID: "1", Q_apperance: "9", date
  };
  let data10 = {
    ID: 0, Qone_type: req.body.qType10, Qone_content: req.body.input10, Form_List_ID: "1", Q_apperance: "10", date
  };
  let data11 = {
    ID: 0, Qone_type: req.body.qType11, Qone_content: req.body.input11, Form_List_ID: "1", Q_apperance: "11", date
  };
  let data12 = {
    ID: 0, Qone_type: req.body.qType12, Qone_content: req.body.input12, Form_List_ID: "1", Q_apperance: "12", date
  };
  let data13 = {
    ID: 0, Qone_type: req.body.qType13, Qone_content: req.body.input13, Form_List_ID: "1", Q_apperance: "13", date
  };
  let data14 = {
    ID: 0, Qone_type: req.body.qType14, Qone_content: req.body.input14, Form_List_ID: "1", Q_apperance: "14", date
  };
  let data15 = {
    ID: 0, Qone_type: req.body.qType15, Qone_content: req.body.input15, Form_List_ID: "1", Q_apperance: "15", date
  };
  let data16 = {
    ID: 0, Qone_type: req.body.qType16, Qone_content: req.body.input16, Form_List_ID: "1", Q_apperance: "16", date
  };
  let data17 = {
    ID: 0, Qone_type: req.body.qType17, Qone_content: req.body.input17, Form_List_ID: "1", Q_apperance: "17", date
  };
  let data18 = {
    ID: 0, Qone_type: req.body.qType18, Qone_content: req.body.input18, Form_List_ID: "1", Q_apperance: "18", date
  };
  let data19 = {
    ID: 0, Qone_type: req.body.qType19, Qone_content: req.body.input19, Form_List_ID: "1", Q_apperance: "19", date
  };
  let data20 = {
    ID: 0, Qone_type: req.body.qType20, Qone_content: req.body.input20, Form_List_ID: "1", Q_apperance: "20", date
  };

  let sql = `INSERT INTO Form_List SET ?`;
  let query = db.query(sql, data, (err, result) => {
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

  let sql3 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Apperance='100' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType1}' AND Qone_content='${req.body.input1}' AND Date='${date}' AND Q_apperance='1')`;
  let query3 = db.query(sql3, (err, result) => {
    if (err) {
      throw err;
    }

  });
  let sql4 = `UPDATE Form_List SET Apperance=(SELECT FORM_LIST_ID FROM Form_Questions WHERE Qone_type ='${req.body.qType1}' AND Qone_content = '${req.body.input1}' AND Q_apperance ='1' AND Date='${date}') WHERE ID=(SELECT ID WHERE Name='${req.body.formName}' AND Apperance ='100')`;
  let sql1000 = `UPDATE Form_List SET Apperance=(SELECT ID FROM Form_Questions WHERE ID IN (SELECT ID WHERE Qone_type ='${req.body.qType1}' AND Qone_content = '${req.body.input1}' AND Q_apperance ='1')) WHERE ID=(SELECT ID WHERE Name='${req.body.formName}' AND Apperance='100') `;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }

  });
  if (data2.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data2, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType2}' AND Qone_content='${req.body.input2}' AND Date='${date}' AND Q_apperance='2')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data3.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data3, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType3}' AND Qone_content='${req.body.input3}' AND Date='${date}' AND Q_apperance='3')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data4.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data4, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType4}' AND Qone_content='${req.body.input4}' AND Date='${date}' AND Q_apperance='4')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data5.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data5, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType5}' AND Qone_content='${req.body.input5}' AND Date='${date}' AND Q_apperance='5')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data6.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data6, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType6}' AND Qone_content='${req.body.input6}' AND Date='${date}' AND Q_apperance='6')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data7.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data7, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType7}' AND Qone_content='${req.body.input7}' AND Date='${date}' AND Q_apperance='7')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data8.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data8, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType8}' AND Qone_content='${req.body.input8}' AND Date='${date}' AND Q_apperance='8')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data9.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data9, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType9}' AND Qone_content='${req.body.input9}' AND Date='${date}' AND Q_apperance='9')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data10.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data10, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType10}' AND Qone_content='${req.body.input10}' AND Date='${date}' AND Q_apperance='10')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data11.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data11, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType11}' AND Qone_content='${req.body.input11}' AND Date='${date}' AND Q_apperance='11')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data12.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data12, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType12}' AND Qone_content='${req.body.input12}' AND Date='${date}' AND Q_apperance='12')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data13.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data13, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType13}' AND Qone_content='${req.body.input13}' AND Date='${date}' AND Q_apperance='13')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data14.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data14, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType14}' AND Qone_content='${req.body.input14}' AND Date='${date}' AND Q_apperance='14')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data15.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data15, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType15}' AND Qone_content='${req.body.input15}' AND Date='${date}' AND Q_apperance='15')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data16.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data16, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType16}' AND Qone_content='${req.body.input16}' AND Date='${date}' AND Q_apperance='16')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data17.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data17, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType17}' AND Qone_content='${req.body.input17}' AND Date='${date}' AND Q_apperance='17')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data18.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data18, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType18}' AND Qone_content='${req.body.input18}' AND Date='${date}' AND Q_apperance='18')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data19.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data19, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType19}' AND Qone_content='${req.body.input19}' AND Date='${date}' AND Q_apperance='19')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  if (data20.Qone_type != null) {

    let sql5 = `INSERT INTO Form_Questions SET ?`;
    let query5 = db.query(sql5, data20, (err, result) => {
      if (err) {
        throw err;
      }
    });

    let sql6 = `UPDATE Form_Questions SET Form_List_ID=(SELECT ID FROM Form_List WHERE Name='${req.body.formName}' AND Creation = '${req.body.date}') WHERE ID=(SELECT ID WHERE Qone_type='${req.body.qType20}' AND Qone_content='${req.body.input20}' AND Date='${date}' AND Q_apperance='20')`;
    let query6 = db.query(sql6, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
  res.send('<script>alert("New form created"); window.location.href = "/admin_list_return"; </script>');

});


app.post("/formInfoChanges", (req, res) => {
  let formID = req.body.name

  let submits = req.body.submit
  let editedSubmits = JSON.stringify(submits);
  question = req.body.question;
  if (editedSubmits.includes("Delete Form") == true) {
    ;
    let sql1 = `DELETE FROM Form_Answers WHERE ID =(SELECT ID WHERE Form_Questions_ID IN (SELECT ID FROM Form_Questions WHERE Form_List_ID='${formID}') )`;
    let sql2 = `DELETE FROM Form_Questions WHERE ID=(SELECT ID WHERE Form_List_ID='${formID}' )`;
    let sql3 = `DELETE FROM Form_List WHERE ID='${formID}'`;
    let query1 = db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let query2 = db.query(sql2, (err, result) => {
      if (err) {
        throw err;
      }
    });
    let query3 = db.query(sql3, (err, result) => {
      if (err) {
        throw err;
      }
      res.send('<script>alert("Form Responses, Form Questions, and Form Deleted"); window.location.href = "/admin_list_return"; </script>');
    });


  }
  else {
    let sql1 = `UPDATE Form_Questions SET Q_apperance='${req.body.Position}' WHERE ID =(SELECT ID WHERE Qone_content='${req.body.question1}' AND Form_List_ID='${formID}')`;
    let query1 = db.query(sql1, (err, result) => {
      if (err) {
        throw err;
      }
      res.send('<script>alert("Form updated"); window.location.href = "/admin_list_return"; </script>');
    });
  }
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
    let sql0=`SELECT * FROM Patient_Info WHERE ID=(SELECT ID WHERE Fname = '${req.body.fname}' AND Lname= '${req.body.lname}')`;
    let query0 = db.query(sql0, (err, result) => {
      if (err) {
        throw err;
      }
      if(result[0]!=undefined){
        res.send('<script>alert("Patient exists in system. Please select yes for previous user prompt"); window.location.href = "/home_return"; </script>');      
      }else{
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
            res.render("dynamicQ1", { data: result1, user: result2 });
          });
        }
      });
    });
  } });
  }
  else {
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
          res.render("dynamicQ1", { data: result1, user: result2 });
      });
      }
    });
  }
});



app.post("/patientAnswers", (req, res) => {
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
  let date = req.body.date
  let apperance = req.body.apperance
  let apperance2=JSON.stringify(apperance);
  let listID= req.body.list
  let listID2= JSON.stringify(listID);
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
  });
  let sql4 = `SELECT Apperance FROM Form_List WHERE ID ='${req.body.list}'`;
  let query4 = db.query(sql4, (err, result) => {
    if (err) {
      throw err;
    }
    let listApperance=result[0].Apperance;
   
if(listApperance=="2" && apperance=="1"){
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
        if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
  }else if(listApperance=="2" && apperance=="2"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="3"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="4"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="5"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="6"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="7"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="8"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="9"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="10"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="11"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="12"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="13"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="14"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="15"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="16"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="17"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="18"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="2" && apperance=="19"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="2" && apperance=="20"){
  let sql = `SELECT * FROM Form_Questions WHERE Form_List_ID=(SELECT ID FROM Form_List WHERE Apperance='3') AND Q_apperance="1"`;
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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


 else if(listApperance=="3" && apperance=="1"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="2"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="3"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="4"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="5"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="6"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="7"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="8"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="9"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="10"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="11"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="12"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="13"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="3" && apperance=="14"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="15"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="16"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="17"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="18"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="19"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="3" && apperance=="20"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
else if(listApperance=="4" && apperance=="1"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="2"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="3"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="4"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="5"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="6"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="7"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="8"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="9"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="10"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="11"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="12"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="13"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
}else if(listApperance=="4" && apperance=="14"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="15"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="16"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="17"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="18"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="19"){
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
    if(result[0]== undefined){
      res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
    }else{
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
}else if(listApperance=="4" && apperance=="20"){
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
      if(result[0]== undefined){
        res.send('<script>alert("All forms completed"); window.location.href = "/home_return"; </script>');
      }else{
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
// Setup server ports
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));




