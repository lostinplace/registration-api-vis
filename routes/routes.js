var routes = [];
routes.push({
  method: 'GET',
  path: '/',
  handler: {
    file: {
      path: 'html/index.html'
    }
  }
});

routes.push({
  method: 'GET',
  path: '/config.js',
  handler: {
    file: {
      path: 'config.js'
    }
  }
});

routes.push({
  method: 'GET',
  path: '/data.json',
  handler: {
    file: {
      path: 'data.json'
    }
  }
});

routes.push({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: 'html'
    }
  }
});

routes.push({
  method: 'GET',
  path: '/js/{param*}',
  handler: {
    directory: {
      path: 'js'
    }
  }
});




routes.push({
  method: 'GET',
  path: '/jspm_packages/{param*}',
  handler: {
    directory: {
      path: 'jspm_packages'
    }
  }
});

module.exports = routes;
