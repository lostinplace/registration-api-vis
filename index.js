var Hapi = require('hapi');
var routes = require('./routes/routes');
var server = new Hapi.Server();
server.connection({ port: 3001 });

routes.forEach(function(v){
  server.route(v);
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'templates')
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
