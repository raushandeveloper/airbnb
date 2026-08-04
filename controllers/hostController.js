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
  // req.files.*.path now holds the full Cloudinary URL (e.g. https://res.cloudinary.com/...)
  const photo = req.files.photo[0].path;
  const pdf = req.files?.pdf?.[0] ? req.files.pdf[0].path : null;
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

      // Old photo/pdf on Cloudinary is simply left as-is (orphaned) and
      // overwritten with the new Cloudinary URL. No local file to delete anymore.
      if (req.files?.photo?.[0]) {
        home.photo = req.files.photo[0].path;
      }

      if (req.files?.pdf?.[0]) {
        home.pdf = req.files.pdf[0].path;
      }

      home
        .save()
        .then((result) => {
          console.log("Home updated ", result);
          res.redirect("/host/host-home-list");
        })
        .catch((err) => {
          console.log("Error while updating ", err);
          res.status(500).send("Error while updating: " + (err && err.message ? err.message : JSON.stringify(err)));
        });
    })
    .catch((err) => {
      console.log("Error while finding home ", err);
      res.status(500).send("Error while finding home: " + (err && err.message ? err.message : JSON.stringify(err)));
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