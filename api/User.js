const express = require("express");
const router = express.Router();

// mongodb user model
const User = require("./../models/User");

// Password handler
const bcrypt = require("bcrypt");

const inFormat = (value) => {
  let restricted = "!~`@#$%^&*()-+=\|}]{[':;/?><èéêëēėęÈÉÊËĒĖĘŸÿûüùúūÛÜÙÚŪîïíīįìÎÏÍĪĮÌôöòóœøōõÔÖÒÓŒØŌÕàáâäæãåāÀÁÂÄÆÃÅĀßśšŚŠžźżŽŹŻçćčÇĆČÑŃñń"
  if (value.length > 1){ //2 characters or more
    for (let c = 0; c < value.length; c++){
      if (restricted.includes(value[c]) || value[c] == " " || value[c] == " \" "){
        return false;
      }
    }
  }
  else { // length <= 1
    if (value == " " || value == "" ){
      return false;
    }
    for (let c = 0; c < value.length; c++){ // length is 1
      if (restricted.includes(value[c]) || value[c] == " \" " ){
        return false;
      }
    }
  }
  return true;
}
//router.post update insta (email, password, insta)
// Signup

router.post("/updateInsta", async (req, res) => {
  try{
    let{email, password, insta} = req.body;
    email = email.trim();
    password = password.trim();
    insta = insta.trim();

    if (email == "" || password == ""){
      res.json({
        status: "FAILED",
        message: "Empty credentials supplied",
      });
    }
    else{
      //check if user exist
      let user = await User.find({email})
      if (user.length){
        //User exists
        user = user[0]
        const hashedPassword = user.password;
        const result = 
          await bcrypt.compare(password, hashedPassword)
        if (result){
          //Password match
          if (inFormat(insta)){
            //insta is valid
            user.insta = insta
            await user.save()
            res.json({
              status: "SUCCESS",
              message: "insta updated",
              data: data,
            })

          }
          else{
            res.json({
              status: "FAILED",
              message: "Invalid instagram",
            })
          }
        }
        else{
          res.json({
            status: "FAILED",
            message: "Invalid password entered!",
          });
        }
      }
      else{
        res.json({
          status: "FAILED",
          message: "User doesn't exist",
        })
      }
    }
  }
  catch(err){
    console.log(err)
    res.json({status:"FAILED", message:"an error occurred in signin"})
  }
});

router.post("/signup", (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();
  email = email.trim();
  password = password.trim();

  if (firstName == "" || firstName == "None" || lastName == "" || lastName == "None" || email == "" || email == "email@email.com" || password == "") {
    res.json({
      status: "FAILED",
      message: "Invalid input fields!",
    });
    console.log("Invalid input fields!")
  } else if (!(/^[a-zA-Z ]*$/.test(firstName) || /^[a-zA-Z ]*$/.test(lastName))) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
    console.log("Invalid name entered")
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
    console.log("Invalid email entered")
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is less than 8 characters",
    });
    console.log("Password is less than 8 characters")
  } else {
    // Checking if user already exists
    //User.find
    User.find({ email })
      .then((result) => {
        if (result.length) {
          // A user already exists
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
          console.log("User with the provided email already exists")
        } else {
          // Try to create new user

          // password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword
              });

              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "Signup successful",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "FAILED",
                    message: "An error occurred while saving user account!",
                  });
                  console.log("An error occurred while saving user account!")
                });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurred while hashing password!",
              });
              console.log("An error occurred while hashing password!")
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

// Signin
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  } else {
    // Check if user exist
    User.find({ email })
      .then((data) => {
        if (data.length) {
          // User exists

          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                // Password match
                res.json({
                  status: "SUCCESS",
                  message: "Signin successful",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Invalid password entered!",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurred while comparing passwords",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "Invalid credenetials entered",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user",
        });
      });
  }
});

module.exports = router;

//http://localhost:3000/user/signup
//https://salty-lowlands-01278.herokuapp.com/user/signup