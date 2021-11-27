const express = require("express");
const Editors = require("../models/editors");
const Ratings = require("../models/ratings");
const Users = require("../models/users");
var authenticate = require("../authenticate");
const cors = require("./cors");

const editorsRouter = express.Router();

editorsRouter.use(express.json());

editorsRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Editors.find({})
      .populate("owner")
      .exec()
      .then(
        (editors) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            status: "GET Data Of All Editors Successfull",
            editors: editors,
          });
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    let fieldsToCreate = {
      name: req.body.name,
      description: req.body.description,
      owner: req.user._id,
      editorHTML: req.body.editorHTML,
      editorCSS: req.body.editorCSS,
      editorJavascript: req.body.editorJavascript,
    };
    for (const [key, value] of Object.entries(fieldsToCreate)) {
      if (value == null) {
        delete fieldsToCreate[key];
      }
    }
    Editors.create(fieldsToCreate)
      .then(
        (editor) => {
          Users.findByIdAndUpdate(
            req.user._id,
            {
              $push: { ownsEditors: editor._id },
            },
            { new: true }
          )
            .exec()
            .then(
              (user) => {
                if (user.ownsEditors.includes(editor._id)) {
                  Editors.findById(editor._id)
                    .populate("owner")
                    .exec()
                    .then(
                      (savedEditor) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                          success: true,
                          status: "Editor Added Successfully!",
                          editor: savedEditor,
                        });
                      },
                      (err) => next(err)
                    )
                    .catch((err) => next(err));
                } else {
                  let err = new Error(
                    "Failed to add editor to user ownsEditors!"
                  );
                  err.status = 500;
                  return next(err);
                }
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: false,
      status: 403,
      err: "PUT operation not supported on /editors",
    });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: false,
      status: 403,
      err: "DELETE operation not supported on /editors",
    });
  });

editorsRouter
  .route("/:editorId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .populate("owner")
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status:
                "GET Data Of Editor With Id " +
                req.params.editorID +
                " Successfull",
              editor: editor,
            });
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: false,
      status: 403,
      err: "POST operation not supported on /editors/" + req.params.editorId,
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            if (editor.owner.equals(req.user._id)) {
              let fieldsToUpdate = {
                name: req.body.name,
                description: req.body.description,
                editorHTML: req.body.editorHTML,
                editorCSS: req.body.editorCSS,
                editorJavascript: req.body.editorJavascript,
              };
              for (const [key, value] of Object.entries(fieldsToUpdate)) {
                if (value != null) {
                  editor[key] = value;
                }
              }
              editor
                .save()
                .then(
                  (savedEditor) => {
                    Editors.findById(savedEditor._id)
                      .populate("owner")
                      .exec()
                      .then(
                        (updatedEditor) => {
                          res.statusCode = 200;
                          res.setHeader("Content-Type", "application/json");
                          res.json({
                            success: true,
                            status: "Editor Updated Successfully!",
                            editor: updatedEditor,
                          });
                        },
                        (err) => next(err)
                      )
                      .catch((err) => next(err));
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              let err = new Error(
                "You are not authorized to update this editor!"
              );
              err.status = 403;
              return next(err);
            }
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            if (editor.owner.equals(req.user._id)) {
              Editors.findByIdAndRemove(req.params.editorId)
                .exec()
                .then(
                  (deletedEditor) => {
                    Users.findByIdAndUpdate(
                      req.user._id,
                      { $pull: { ownsEditors: deletedEditor._id } },
                      { new: true }
                    )
                      .exec()
                      .then(
                        (updatedUser) => {
                          if (
                            !updatedUser.ownsEditors.includes(deletedEditor._id)
                          ) {
                            Ratings.deleteMany({ editorId: editor._id })
                              .exec()
                              .then(
                                (resp) => {
                                  res.statusCode = 200;
                                  res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  res.json({
                                    success: true,
                                    status: "Editor Deleted Successfully",
                                    editor: deletedEditor,
                                  });
                                },
                                (err) => next(err)
                              )
                              .catch((err) => next(err));
                          } else {
                            let err = new Error(
                              "Failed to delete editor from user ownsEditors!"
                            );
                            err.status = 500;
                            return next(err);
                          }
                        },
                        (err) => next(err)
                      )
                      .catch((err) => next(err));
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              let err = new Error(
                "You are not authorized to delete this editor!"
              );
              err.status = 403;
              return next(err);
            }
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

editorsRouter
  .route("/:editorId/rating")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            Ratings.findOne({
              userId: req.user._id,
              editorId: req.params.editorId,
            })
              .exec()
              .then(
                (rating) => {
                  if (rating) {
                    res.json({
                      success: true,
                      status: "Rating Found!",
                      rating: rating,
                    });
                  } else {
                    res.json({
                      success: false,
                      status: "Rating Not Found!",
                      err:
                        "You Have Not Yet Rated The Editor With Id " +
                        req.params.editorId,
                    });
                  }
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            var ratingValue = Number(req.body.ratingValue);
            Ratings.countDocuments({
              userId: req.user._id,
              editorId: req.params.editorId,
            })
              .exec()
              .then(
                (ratedBefore) => {
                  if (!ratedBefore) {
                    Ratings.create({
                      userId: req.user._id,
                      editorId: req.params.editorId,
                      ratingValue: ratingValue,
                    })
                      .then(
                        (rating) => {
                          if (rating != null) {
                            Editors.findByIdAndUpdate(
                              req.params.editorId,
                              {
                                $inc: {
                                  ratingCount: 1,
                                  ratingValue: ratingValue,
                                },
                              },
                              { new: true }
                            )
                              .exec()
                              .then(
                                (updatedEditor) => {
                                  res.statusCode = 200;
                                  res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                  );
                                  res.json({
                                    success: true,
                                    status: "Rating Successful",
                                  });
                                },
                                (err) => next(err)
                              )
                              .catch((err) => next(err));
                          }
                        },
                        (err) => next(err)
                      )
                      .catch((err) => next(err));
                  } else {
                    let err = new Error(
                      "You Have Already Rated The Editor With Id " +
                        req.params.editorId
                    );
                    err.status = 403;
                    return next(err);
                  }
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Editors.findById(req.params.editorId)
      .exec()
      .then(
        (editor) => {
          if (editor != null) {
            var ratingValue = Number(req.body.ratingValue);
            Ratings.findOneAndUpdate(
              { userId: req.user._id, editorId: req.params.editorId },
              { ratingValue: ratingValue }
            )
              .then(
                (previousRating) => {
                  if (previousRating != null) {
                    Editors.findByIdAndUpdate(
                      req.params.editorId,
                      {
                        $inc: {
                          ratingValue: ratingValue - previousRating.ratingValue,
                        },
                      },
                      { new: true }
                    )
                      .exec()
                      .then(
                        (updatedEditor) => {
                          res.statusCode = 200;
                          res.setHeader("Content-Type", "application/json");
                          res.json({
                            success: true,
                            status: "Rating Updated Successfully",
                          });
                        },
                        (err) => next(err)
                      )
                      .catch((err) => next(err));
                  } else {
                    let err = new Error(
                      "You Have Not Yet Rated The Editor With Id " +
                        req.params.editorId
                    );
                    err.status = 403;
                    return next(err);
                  }
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            let err = new Error(
              "Editor With Id " + req.params.editorId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: false,
      status: 403,
      err:
        "DELETE operation not supported on /editors/" +
        req.params.editorId +
        "/rating",
    });
  });

module.exports = editorsRouter;
