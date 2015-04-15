console.log(123);

  var app = angular.module('RouteApp', ['ngRoute']);

  app.config(function($routeProvider, $locationProvider) {
   $routeProvider
    .when('/1', {
     templateUrl: 'test1.html',
     controller: 'ScreenCtrl',
     next: '2'
   })
    .when('/2', {
     templateUrl: 'test2.html',
     controller: 'ScreenCtrl',
     next: '3',
     last: '1',
   })
    .when('/3', {
     templateUrl: 'test3.html',
     controller: 'ScreenCtrl',
     last: '2',
   });
  });

  function objToUrl(obj){
    var str = '';
    for(var i in obj){
      str += '&' + i + '=' + obj[i];
    }
    return str.slice(1);
  }


  app.factory('State', [function() {
    var State = {
      model: {
        first : "foo",
        middle: "bar",
        last  : "baz"
      },

      // Update the State.model with new information
      update: function(changedModel) {

        // But lets keep it clean: We only want params in the model to persist
        // in the URL
        for (var param in changedModel) {
          if (State.model.hasOwnProperty(param)) {
            State.model[param] = changedModel[param];
          }
        }
      }
    };

    return State;
  }]);


  app.controller('ScreenCtrl', ['$scope', '$location', '$routeParams', '$route', 'State',
  function($scope, $location, $routeParams, $route, State){


    // When the $scope is initialized, create an empty model
    $scope.model = {};

    // Then copy anything from the State.model to the $scope.
    // The State model will store the state of the model scross routes.
    angular.extend($scope.model, State.model);

    // We want to keep the history of the model, so each time we move to a new
    // screen that requires new input, we want to store the model's state in
    // the url history.

    // Check if the $scope.model is different to $routeParams in the URL
    if (!angular.equals($scope.model, $routeParams)) {

      // If they do not match, lets update the model with new params so that
      // anyone returning to the page from an external link, will have the same
      // model that they left the page with.
      //
      // We do this by copying the $routeParams to the $scope model:
      angular.extend($scope.model, $routeParams);

      // And we also want to reflect these changes in the State, so another
      // route will be able pick up the changes too:
      State.update($scope.model);
    }

    // Then if the model is changed via the UI forms:
    $scope.$watch('model', function(changedModel){

      // We also want to update the state:
      State.update(changedModel);

      // Note: we do not want to update the URL params just yet...
      // that would trigger a refresh of the $scope, which would in turn
      // re-trigger this change function when we extend $scope.model with the
      // $state.model, which would... (an undesired infinite loop)
    }, true);


    // However: When we want to link outside of the screens, we want to be able
    // to get back to the state of the model before we left, so...
    $scope.linkout = function(url){

      // We change URL params to preserve history/model state in the URL...
      $location.search($scope.model);

      // ...and in the blink of an eye: change the URL to the new location.
      window.location = url;

      // Now when the user hits the back button, they return to the page with
      // updated URL search params, which copies the $routeParams down to the
      // $scope.model and shares it with the other routes via the State.model.
    };

    $scope.next = function(){
      // Using $$ in angular is a no-no. Is there a better way to define custom
      // properties in a route?
      $location.url($route.current.$$route.next + '?' + objToUrl(State.model));

      // Does IE9 support history state url HTML mode?
      // If it does, this is good!
      // $location.state(???);
    };

    $scope.last = function(){
      $location.url($route.current.$$route.last + '?' + objToUrl(State.model));
    };
  }]);
