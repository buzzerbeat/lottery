// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ngCordova'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/dash',
        cache:false,
        views: {
          'tab-dash': {

            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('tab.pick', {
        url: '/pick',
        views: {
          'tab-dash': {
            templateUrl: 'templates/pick-number.html',
            controller: 'PickCtrl'
          }
        }

      })
      .state('tab.history', {
        url: '/history',
        views: {
          'tab-dash': {
            templateUrl: 'templates/award-history.html',
            controller: 'HistoryCtrl'
          }
        }

      })

      .state('tab.betting', {
        url: '/betting',
        views: {
          'tab-dash': {
            templateUrl: 'templates/betting-history.html',
            controller: 'BettingCtrl'
          }
        }

      })

      .state('tab.register', {
        url: '/register',
        views: {
          'tab-dash': {
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
          }
        }

      })

      // .state('tab.chats', {
      //   url: '/chats',
      //   views: {
      //     'tab-chats': {
      //       templateUrl: 'templates/tab-chats.html',
      //       controller: 'ChatsCtrl'
      //     }
      //   }
      // })
      // .state('tab.chat-detail', {
      //   url: '/chats/:chatId',
      //   views: {
      //     'tab-chats': {
      //       templateUrl: 'templates/chat-detail.html',
      //       controller: 'ChatDetailCtrl'
      //     }
      //   }
      // })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
    $ionicConfigProvider.tabs.position('bottom');

  })



  .constant("params", {
    "RED_LIMIT": 6,
    "BLUE_LIMIT": 1,
    "BASE_URL": 'http://qy1.appcq.cn:8087/',
    "LOADING_CONFIG":{
      content:"Loading",
      animation:"fade-in",
      showBackdrop:true,
      maxWidth:200,
      showDelay:0
    }
  });
