const fs = require("fs");
const path = require("path");
const Home = require("../models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("Home not found for editing.");
        return res.redirect("/host/host-home-list");
      }

      console.log(homeId, editing, home);
      res.render("host/edit-home", {
        home: home,
        pageTitle: "Edit your Home",
        currentPage: "host-homes",
        editing: editing,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log("Error while loading home for editing", err);
      res.redirect("/host/host-home-list");
    });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  if (!req.files?.photo?.[0]) {
    return res.status(422).send("No image provided");
  }

  const { houseName, price, location, rating, description } = req.body;
  const photo = `/uploads/${req.files.photo[0].filename}`;
  const pdf = req.files?.pdf?.[0] ? `/uploads/${req.files.pdf[0].filename}` : null;
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    pdf,
    description,
  });

  home
    .save()
    .then(() => {
      console.log("Home Saved successfully");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error while saving home ", err);
      next(err);
    });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if (req.files?.photo?.[0]) {
        const oldPhotoPath = home.photo ? path.join(process.cwd(), 'uploads', path.basename(home.photo)) : null;
        if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
        home.photo = `/uploads/${req.files.photo[0].filename}`;
      }

      if (req.files?.pdf?.[0]) {
        const oldPdfPath = home.pdf ? path.join(process.cwd(), 'uploads', path.basename(home.pdf)) : null;
        if (oldPdfPath && fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
        home.pdf = `/uploads/${req.files.pdf[0].filename}`;
      }

      home
        .save()
        .then((result) => {
          console.log("Home updated ", result);
          res.redirect("/host/host-home-list");
        })
        .catch((err) => {
          console.log("Error while updating ", err);
          next(err);
        });
    })
    .catch((err) => {
      console.log("Error while finding home ", err);
      next(err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Came to delete ", homeId);

  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting ", error);
      next(error);
    });
};
