const Favourite = require("../models/favourite");
const Home = require("../models/home");



exports.getIndex = (req,res,next)=>{
    const registeredHomes = Home.fetchAll((registeredHomes)=>
         res.render('store/index',{ registeredHomes: registeredHomes,pageTitle: "airbnb Home",currentPage:'index' 
         })
        );
};

exports.getHomes = (req,res,next)=>{
    const registeredHomes = Home.fetchAll((registeredHomes)=>
         res.render('store/home-list',{ registeredHomes: registeredHomes,pageTitle: "Homes List",currentPage:'Home' 
         })
        );
};
 
exports.getBookings = (req,res,next)=>{
   res.render('store/bookings',{
    pageTitle: "My Bookings",
    currentPage:'bookings' 
     });
};

exports.getFavouritesList = (req, res, next) => {
    Favourite.getFavourites(favourites => {
        Home.fetchAll((registeredHomes) => {
            // ✅ Filter FIRST, assign to variable
            const favouriteHomes = registeredHomes.filter(home => {
                return favourites.includes(home.id); // ✅ Use the fetched favourites here
            });

            // ✅ Render AFTER filter is complete, outside the filter callback
            res.render('store/favourite-list', {
                favouriteHomes: favouriteHomes,
                pageTitle: "My Favourites",
                currentPage: 'favourites'
            });
        });
    });
};

exports.postAddToFavourite = (req,res,next)=>{
     Favourite.addToFavourite(req.body.id, error=>{
          if(error){
               console.log("Error while marking favourite",error);
          }
          res.redirect("/favourites");
     })
}

exports.postRemoveFromFavourite = (req,res,next)=>{
     const homeId = req.params.homeId;
     Favourite.deleteById(homeId,error =>{
          if(error){
               console.log('Error while removing from Favourite',error);
          }
          res.redirect("/favourites");
     })
}

exports.getHomeDetails = (req,res,next)=>{
     const homeId = req.params.homeId;
     console.log("At home details page",homeId);
     Home.findById(homeId, home =>{
          if(!home){
               console.log("Home not found");
               res.redirect("/homes");
          }else{
          res.render("store/home-detail",{
               home:home, 
               pageTitle: "Home Detail",
               currentPage: "Home", 
          });
     }
     })
};