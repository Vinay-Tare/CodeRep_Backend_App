var express = require("express");
var Users = require("../models/users");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");

var usersRouter = express.Router();
usersRouter.use(express.json());

/* GET users listing. */

usersRouter.options("*", cors.corsWithOptions, (req, res, next) => {
  return res.sendStatus(200);
});

usersRouter.get("/", cors.corsWithOptions, (req, res, next) => {
  Users.find({})
    .exec()
    .then(
      (users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          status: "GET Data Of All Users Successfull",
          users: users,
        });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

usersRouter.post("/register", cors.corsWithOptions, (req, res, next) => {
  Users.register(
    new Users({
      username: req.body.username,
      fullName: req.body.fullName,
      email: req.body.email,
      description: req.body.description,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.status = 500;
        res.setHeader("Content-Type", "application/json");
        return res.json({
          success: false,
          status: "Registration Unsucessfull!",
          err: err,
        });
      }
      passport.authenticate("local", { session: false })(req, res, () => {
        res.status = 200;
        res.setHeader("Content-Type", "application/json");
        return res.json({ success: true, status: "Registration Successful!" });
      });
    }
  );
});

usersRouter.post("/login", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.status = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({
        success: false,
        status: "Login Unsuccessfull!",
        err: info,
      });
    }

    req.logIn(user, { session: false }, (err) => {
      if (err) {
        res.status = 401;
        res.setHeader("Content-Type", "application/json");
        return res.json({
          success: false,
          status: "Login Unsuccessfull!",
          err: "Could not log in user!",
        });
      }

      var token = authenticate.getToken({ _id: req.user._id });
      res.status = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({
        success: true,
        status: "Login Successfull!",
        token: token,
      });
    });
  })(req, res, next);
});

usersRouter.get("/checkJWTToken", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({
        success: false,
        status: "JWT Invalid!",
        err: info,
      });
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.json({
      success: true,
      status: "JWT Valid!",
      user: user,
    });
  })(req, res, next);
});

module.exports = usersRouter;
