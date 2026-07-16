const Home = require("../models/home");

exports.getHomes = (req, res, next) => {
    Home.fetchAll((homes) => {
        res.render("host/homes", {
            pageTitle: "My Homes",
            currentPage: 'homes',
            homes: homes
        });
    });
};

exports.getAddHome = (req, res, next) => {
    res.render("host/edit-home", {
        pageTitle: "Add Home to airbnb",
        currentPage: 'addHome',
        editing: false,
    });
};

exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';

    Home.findById(homeId, home => {
    if(!home){
        console.log("Home not found for editing.");
        return res.redirect("/host/host-home-list");
    }
    console.log(homeId,editing,home);
    res.render("host/edit-home", {
        home:home,
        pageTitle: "Edit your Home",
        currentPage: 'host-homes',
        editing: editing,
    });
    });
};

exports.getHostHomes = (req,res,next)=>{
    const registeredHomes = Home.fetchAll((registeredHomes)=>
         res.render('host/host-home-list',{ registeredHomes: registeredHomes,pageTitle: "Host Homes List",currentPage:'host-homes' 
         })
        );
};

exports.postAddHome = (req, res, next) => {
    const { houseName, price, location, rating, photoUrl } = req.body;
    const home = new Home(houseName, price, location, rating, photoUrl);
    home.save();
    res.redirect("host/host-home-list");
};

exports.postEditHome = (req, res, next) => {
    const { id, houseName, price, location, rating, photoUrl } = req.body; // ✅ homeId → id

    const updatedHome = new Home(houseName, price, location, rating, photoUrl);
    updatedHome.id = id; // ✅

    updatedHome.save();
    res.redirect('/host/host-home-list');
};

exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    console.log('came to delete',homeId);
    Home.deleteById(homeId,error =>{
        if(error){
            console.log('Error while deleting',error);
        }
        res.redirect("/host/host-home-list");
    })
};