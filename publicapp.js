module.exports = (app, config) => {
   app.get('*', function(req, res, next) {
      console.log('http get: ' + req.url);
      return next();
   });
   app.set('view engine','ejs');
   app.get('/braslet/:id', function(req, res) {
      try {
         res.render(__dirname + "/public/braslet", {
            brasletColor: req.params.id,
            queenbridgeUrl: config.settings.queenbridgeUrl
         });
      }
      catch(error) {
         console.log('error : ' + error);
      }
   });
   app.get('/games/:id', function(req, res) {
      try {
         res.render(__dirname + "/public/games/" + req.params.id, {
            queenbridgeUrl: config.settings.queenbridgeUrl
         });
      }
      catch(error) {
         console.log('error : ' + error);
      }
   });   
}
