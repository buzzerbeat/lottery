/**
 * Created by Cao on 16/4/20.
 */
angular.module('starter.directives', [])

.directive('hideTabs', function($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      scope.$watch(attributes.hideTabs, function(value){
        $rootScope.hideTabs = value;
      });

      scope.$on('$destroy', function() {
        $rootScope.hideTabs = false;
      });
    }
  };
});
