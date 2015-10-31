(function(angular) {
  'use strict';

  angular.module('poc-routes', ['ui.router']);

  angular.module('poc-routes').config(['$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('login', {
          url: '/login',
          controller: ['$scope',
            '$state',
            'api',
            function($scope, $state, api) {
              $scope.login = function() {
                api.login();
              };

              $scope.goHome = function() {
                $state.go('logged.home');
              }
            }
          ],
          template: '<button data-ng-click="login()">Login</button>' +
          '<button data-ng-click="goHome()">Home</button>',
          resolve: {
            isAuth: function($q, auth) {
              if (auth.isAuthenticated()) {
                return $q.reject({
                  state: 'home'
                });
              }
            }
          }
        })

        .state('logged', {
          abstract: true,
          template: '<div data-ui-view></div>',
          resolve: {
            isAuth: function($q, auth) {
              if (!auth.isAuthenticated()) {
                alert('You must be logged in!');
                return $q.reject({
                  state: 'login'
                });
              }
            }
          }
        })

        .state('logged.home', {
          url: '/home',
          controller: ['$scope',
            'api',
            function($scope, api) {
              $scope.derp = 'derp';

              api.getDerp().success(function(data) {
                $scope.derp = data;
              });
            }],
          template: '<p>You successfully logged in!</p>' +
          '<p>{{derp}}</p>'
        });

      $urlRouterProvider.otherwise('logged.home');
    }
  ]);

  angular.module('poc-routes').config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('tokenInjector');
    }
  ]);

  angular.module('poc-routes').run(['$rootScope',
    '$state',
    function($rootScope, $state) {
      $rootScope.$on('$stateChangeError', function(event, toState,
        toStateParams, fromState, fromStateParams, error) {
        if (error && error.state) {
          $state.go(error.state, error.params, error.options);
        }
      });
    }
  ]);

  angular.module('poc-routes').service('api', ['$http',
    'auth',
    function($http, auth) {
      return {
        login: function() {
          $http({
            method: 'GET',
            url: 'http://127.0.0.1:9001/api/auth'
          }).success(function(token) {
            auth.setToken(token);
          });
        },
        getDerp: function() {
          return $http({
            method: 'GET',
            url: 'http://127.0.0.1:9001/api/derp'
          });
        }
      }
    }
  ]);

  angular.module('poc-routes').factory('auth', function() {
    var auth = false,
      token = null;

    return {
      isAuthenticated: function() {
        return auth && token;
      },
      getToken: function() {
        return token;
      },
      setToken: function(value) {
        auth = true;
        token = value;
      }
    };
  });

  angular.module('poc-routes').factory('tokenInjector', function(auth) {
    return {
      request: function(config) {
        if (auth.isAuthenticated()) {
          config.headers['X-Token'] = auth.getToken();
        }
        return config;
      }
    };
  });
}(angular));
