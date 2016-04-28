angular.module('starter.controllers', ['ionic', 'ngResource', 'LocalForageModule'])

  .controller('DashCtrl', function ($scope, UserApi, params, Picks, $localForage, $http) {
    $localForage.getItem('authKey').then(function (token) {
      if (!token) {
        console.log('request register');
        var config = {
          "Content-Type": "application/json"
        };
        $http.post(params.BASE_URL + '/user/register', JSON.stringify({'uuid': $scope.deviceId}), config).then(function (response) {
          console.log(response.status);
          console.log(JSON.stringify(response.data));
          $window.sessionStorage.access_token = response.data.user.auth_key;
          $scope.token = $window.sessionStorage.access_token;
          $localForage.setItem('authKey',response.data.user.auth_key).then(function(err) {
            console(err);
            getUserInfo();
          });
        }, function (response) {
          alert('设备注册异常');
        });
      } else {
        getUserInfo();
      }
    });

    function getUserInfo() {
      console.log('getUserInfo');
      UserApi.get(params.BASE_URL + 'init', {}, function (response) {
        console.log(JSON.stringify(response.data));
        $scope.username = response.data.user.username;
        $scope.points = response.data.user.points;
        Picks.current_period = response.data.period.current.period;
        // $scope.peri = response.data.user.points;
      }, function (response) {
        console.log('error');
        console.log(response);
        console.log(JSON.stringify(response.data));
      });
    }

  })

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })

  .controller('HistoryDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })
  .controller('BettingCtrl',
    function ($scope, params, Bettings, $ionicLoading, $resource, Basic, UserApi) {
      var periods = $scope.periods = [];
      var bettings = $scope.bettings = [];
      var currentPeriod = "";
      $scope.refreshData = function () {
        Basic.show();

          UserApi.resource(params.BASE_URL + 'betting/:id', 'GET', function (data) {
            Basic.hide();
            angular.forEach(data, function (betting) {
              // var difference = betting.period - currentPeriod;
              if (betting.period != currentPeriod) {
                addPeriod(betting.periodDesc);
              }
              currentPeriod = betting.period;
              console.log(betting.numbers);
              bettings.push(betting);
            })
          });

        console.log(bettings);
      }

      function addPeriod(period) {
        bettings.push({
          isPeriod: true,
          period: period
        });
        periods.push(period);
      }

      $scope.refreshData();

    })
  .controller('HistoryCtrl', function ($scope, params, History, $ionicLoading, $resource, Basic, UserApi) {


      $scope.historyData = [];
      $scope.refreshData = function () {
        Basic.show();
        UserApi.resource(params.BASE_URL + 'award/:id', 'GET', function (data) {
          Basic.hide();
          $scope.historyData = data;
        });
      }
      $scope.refreshData();

    }
  )
  .controller('PickCtrl', function ($scope, params, Picks, $ionicPopup, $timeout, $ionicLoading, $ionicHistory, Basic, $window, $http, $filter, UserApi) {


    $scope.reds = Picks.init_red();
    $scope.selectedReds = [];


    $scope.blues = Picks.init_blue();
    $scope.selectedBlues = [];

    $scope.bluestyle = "blue-dark";
    $scope.redstyle = "red-dark";

    $scope.period = Picks.current_period;

    $scope.blueToggle = function (data) {

      if (Picks.in_array(data, $scope.selectedBlues)) {
        $scope.selectedBlues.pop(data);
      } else {

        $scope.selectedBlues.push(data);
        console.log($scope.selectedBlues.length);
        console.log(params.BLUE_LIMIT);
        if ($scope.selectedBlues.length > params.BLUE_LIMIT) {
          $scope.selectedBlues.shift();
        }
      }
    }

    $scope.redToggle = function (data) {
      if (Picks.in_array(data, $scope.selectedReds)) {
        $scope.selectedReds.pop(data);
      } else {
        $scope.selectedReds.push(data);
        if ($scope.selectedReds.length > params.RED_LIMIT) {
          $scope.selectedReds.shift();
        }

      }
    }

    $scope.inArray = function (item, array) {
      return Picks.in_array(item, array);
    }

    $scope.randomSelected = function () {
      var randoms = Picks.random_nums(6, 35);
      $scope.selectedReds = randoms;
      var randoms = Picks.random_nums(1, 12);
      $scope.selectedBlues = randoms;

    }

    $scope.submitPick = function () {
      var verify = Picks.verify($scope.selectedBlues, $scope.selectedReds);
      if (verify.status) {
        // verify failed
        var alertPopup = $ionicPopup.alert({
          title: '提示',
          template: verify.message
        });

        alertPopup.then(function (res) {
          console.log('Tap Ok');
        });

        $timeout(function () {
          alertPopup.close(); //close the popup after 1.5 seconds for no user op
        }, 1500);
        return;
      }

      Basic.show();


      var now = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
      var pickNumbers = [];
      $scope.selectedReds.forEach(function (red) {
        pickNumbers.push(red);
      });
      console.log(pickNumbers);
      $scope.selectedBlues.forEach(function (blue) {
        pickNumbers.push(blue);
      });
      console.log(pickNumbers);
      console.log(now);
      console.log($scope.period.toString());


      UserApi.post(

        params.BASE_URL + 'betting/bet',
        {
          pick_time: now,
          period: $scope.period.toString(),
          numbers: pickNumbers

        },
        function (response) {
          console.log(JSON.stringify(response.data));
          Basic.hide();
          if (!response.data.status) {
            var alertPopup = $ionicPopup.alert({
              title: '提示',
              template: '投注成功'
            });

            alertPopup.then(function (res) {
              console.log('Tap Ok');
              $ionicHistory.goBack();
            });
          } else {
            var alertPopup = $ionicPopup.alert({
              title: '错误',
              template: response.data.message
            });

            alertPopup.then(function (res) {
              console.log('Tap Ok');
              $ionicHistory.goBack();
            });
          }

        }, function (response) {
          // console.log(response);
          console.log(JSON.stringify(response.data));
        }
      );


    }


  })
  .controller('RegisterCtrl', function ($scope, $http, $localForage, $window, UserApi, params, $filter) {
    // $scope.settings = {
    //   enableFriends: true
    // };

    document.addEventListener("deviceready", function () {

      console.log(device.uuid);
      $scope.deviceId = device.uuid;
      $scope.password = "123456";
      $scope.token = "none";
    }, false);

    $localForage.getItem('authKey').then(function (data) {
      // if (data)
      $scope.token = data;
    });

    $scope.sign = function () {
      var now = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
      console.log(now);
      UserApi.post(params.BASE_URL + 'user/sign',
        {
          sign_time:now
        },function (response) {
          console.log(response.data);
          if (response.data.status == 0) {
            alert('签到成功');
          } else {
            alert('签到失败');
          }
        }, function (response) {
          console.log('error');
          console.log(response.data);
          alert('签到失败');
        }


      );
      // $localForage.getItem('authKey').then(function (token) {
      //   // if (data)
      //   // var token = $window.sessionStorage.access_token;
      //   // token = 'UEEe4yeo8AJdw0Gl_BpLibcB1YFVzF3U';
      //   var req = {
      //     method: 'POST',
      //     url: 'http://qy1.appcq.cn:8087/user/sign',
      //     headers: {
      //       "Content-Type": "application/json",
      //       "Authorization": "Bearer " + token
      //     },
      //     data: {}
      //   }
      //
      //   $http(req).then(function (response) {
      //     console.log(response);
      //   }, function (response) {
      //     console.log(response);
      //   });
      // });

      // console.log(token);
      // var config = {
      //   headers: {
      //     "Authorization": "Bearer " + token
      //   }
      // };
      //
      // $http.post('http://qy1.appcq.cn:8087/betting/dashboard', null, config).then(function (response) {
      //   console.log(response.status);
      //   console.log(JSON.stringify(response.data));
      //
      // }, function (response) {
      //   console.log(response.data);
      // });
    }

    $scope.register = function () {

      var config = {
        "Content-Type": "application/json"
      };
      $http.post(params.BASE_URL + '/user/register', JSON.stringify({'uuid': $scope.deviceId}), config).then(function (response) {
        // this callback will be called asynchronously
        // when the response is available
        console.log(response.status);
        console.log(JSON.stringify(response.data));
        $window.sessionStorage.access_token = response.data.user.auth_key;
        $scope.token = $window.sessionStorage.access_token;
        $localForage.setItem('authKey',response.data.user.auth_key).then(function(err) {
          // $localForage.getItem('authKey').then(function(data) {
          //   $scope.token = data;
          // });
        });

        // $scope.token = response.data.user.auth_key;
        // console.log(response.data);
      }, function (response) {
        // console.log(response.status);
        // console.log(response.data);
        // console.log(JSON.stringify(response.data));
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

      // $http.get("http://qy1.appcq.cn:8089/user/api")
      //   .then(function(response, status){
      //     console.log(response);
      //     console.log(status);
      //     $scope.status = status;
      //     $scope.messages = response;
      //     // $scope.details = response.data;
      //   }, function(response, status){
      //     console.log("error");
      //     console.log(response);
      //     console.log(status);
      //
      //     // $scope.details = response.data;
      //   });
      // $http.jsonp("http://qy1.appcq.cn:8089/user/api").success(function(data, status) {
      //
      // }).error(function(data, status) {
      //   console.log(data);
      //   $scope.messages = data || "Request failed";
      //   $scope.status = status;
      // });
      // Oauth.auth();

    }
  });
