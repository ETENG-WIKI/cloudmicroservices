angular
  .module('app')
  .factory('myInterceptor', myInterceptor);

function myInterceptor($injector, $q) {
  var host = 'http://localhost:3002/';
  var alternateHost = 'http://localhost:3001/';
  var alternateToken = window.localStorage.getItem('permissiontoken');

  return {
    request: function(config) {
      var $http = $injector.get('$http');
      if (!(config.method === 'PUT' && config.url.indexOf(host) === 0)) {
        return config;
      }

      config.url = config.url.replace(host, alternateHost);
      config.headers.Authorization = 'Bearer ' + alternateToken;
      console.log('after:', config);

      return $http(config).then(function() {
        return config;
      });
    },
    response: function(response) {
      var $http = $injector.get('$http');
      var config = response.config;

      if (!(config.method === 'GET' && config.url.indexOf(host) === 0)) {
        return response;
      }

      config.url = config.url.replace(host, alternateHost);
      config.headers.Authorization = 'Bearer ' + alternateToken;

      return $http(config).then(function(newResponse) {
        if (Array.isArray(response.data)) {
          var indexed = newResponse.data.reduce(function(memo, values) {
            memo[values.id] = values;
            return memo;
          }, {});

          response.data.forEach(function(record) {
            var value = indexed[record.id] || {};
            record.roles = value.roles;
          });
        } else {
          response.data.roles = newResponse.data.roles;
        }
        return response;
      });
    }
  };
}