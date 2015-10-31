(function(proc, logger) {
  var express = require('express'),
    app = express(),
    host = proc.env.HOST || '127.0.0.1',
    port = proc.env.PORT || 9001;

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, X-Token');
    next();
  });

  app.get('/api/auth', function(req, res) {
    logger.log(req.get('X-Token'));
    logger.log('Auth request');
    res.send('my-token');
  });

  app.get('/api/derp', function(req, res) {
    logger.log(req.get('X-Token'));
    res.send('herp');
  });

  app.listen(port, function() {
    logger.log('App listening at http://%s:%s', host, port);
  });
}(process, console));
