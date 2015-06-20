var Hapi = require('hapi');
var routes = require('./routes/routes');
var server = new Hapi.Server();
server.connection({ port: 3000 });

routes.forEach(function(v){
  server.route(v);
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
