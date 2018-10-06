'use strict';
module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('pages/index');
  });
  app.get('/about', function(req, res) {
    res.render('pages/about');
  });
  app.get('/client', function(req, res) {
    res.render('pages/client');
  });
  app.get('/cmds', function(req, res) {
    res.render('pages/commands', { url: req.protocol + '://' + req.get('host') + req.originalUrl })
  });
  app.get('/perms', (req, res) => {
    res.render('pages/perms')
  })
};