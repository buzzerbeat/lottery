angular.module('starter.controllers', ['ionic', 'ngResource', 'LocalForageModule'])

  .controller('signCtrl', function ($scope, UserApi) {
    // $scope.allowSign = UserApi.user.allowSign;
    if (UserApi.user) {
      $scope.isLogin = true;
      $scope.allowSign = UserApi.user.allowSign;
      if (UserApi.user.allowSign) {



      } else {
        $scope.points = UserApi.user.points;
      }
    } else {
      $scope.isLogin = false;

    }


  })
  .controller('DashCtrl', function ($scope, UserApi, params, Picks, $localForage, $http,
                                    $window, Basic, $filter, $ionicSlideBoxDelegate, WebviewService, $ionicPlatform ) {

    $ionicPlatform.ready(function () {

      console.log(device.uuid);
      $scope.deviceId = device.uuid;

      $localForage.getItem('authKey').then(function (token) {
        console.log('before register');
        console.log(token);
        if (!token) {
          console.log('request register');
          var config = {
            "Content-Type": "application/json"
          };
          $http.post(params.BASE_URL + 'user/register', {'uuid': $scope.deviceId}, config).then(function (response) {
            console.log(response.status);
            console.log(JSON.stringify(response.data));
            if (response.data.status == 0) {
              $localForage.setItem('authKey', response.data.user.auth_key).then(function (err) {
                console.log(err);
                getUserInfo();
              });
            } else {
              console.log(response.data.message);
              alert('设备注册失败：' + response.data.message);
            }
          }, function (response) {
            console.log(response.status);
            console.log(JSON.stringify(response.data));
            alert('设备注册异常');
          });
        } else {
          getUserInfo();
        }
      });
    });
    // } else {
    //   getUserInfo();
    // }
// watch Acceleration options
    // watch Acceleration options



    // function deviceReady() {
    // }


    function getUserInfo() {
      console.log('getUserInfo');
      UserApi.get(params.BASE_URL + 'init', {}, function (response) {
        console.log(JSON.stringify(response.data));
        UserApi.user = response.data.user;
        $scope.user = response.data.user;
        $scope.banners = response.data.banners;
        console.log($scope.banners);
        Picks.current_period = response.data.period.current.period;
        var a = new Date(); // Now
        var b = new Date(response.data.period.current.endtime.replace(/-/g,"/")); // 2010

        Picks.endtime = Math.floor((b-a) / 1000);
        // Picks.endtime = new Date(response.data.period.current.endtime.replace(/-/g,"/")).getTime();
        console.log('Picks.endtime');
        // console.log(b.getTime());
        // console.log(response.data.period.current.endtime.replace(/-/g,"/"));
        console.log(Picks.endtime);
        console.log((b-a));

        $scope.currentPeriod = Picks.current_period;
        if (response.data.period.last) {
          $scope.lastAwardNum = response.data.period.last.awardNum;
        }

        $scope.currentEndtime = Date.parse(response.data.period.current.drawtime).toString('周ddd H:m');
        if (UserApi.user) {
          $scope.allowSign = UserApi.user.allowSign;
          $scope.points = UserApi.user.points;
          $scope.isLogin = 1;
        } else {
          $scope.allowSign = 0;
          $scope.points = 0;
          $scope.isLogin = 0;
        }

        // $scope.peri = response.data.user.points;
      }, function (response) {
        console.log('error');
        console.log(response);
        console.log(JSON.stringify(response.data));
      });
    }
    $scope.slideChanged = function (changed) {

    }
    $scope.gotoLink = function (link, title) {
      console.log(link);
      WebviewService.setLink(link, title);
      $window.location = "#/tab/webview"
    }

    $scope.updateSlider = function () {
      $ionicSlideBoxDelegate.update();
    }
    $scope.sign = function () {
      if (UserApi.user.allowSign) {

        var now = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
        console.log(now);
        Basic.show();
        UserApi.post(params.BASE_URL + 'user/sign',
          {
            sign_time: now
          }, function (response) {
            Basic.hide();
            console.log(response.data);
            if (response.data.status == 0) {
              alert('签到成功');
              getUserInfo();
              // $scope.allowSign = false;
            } else {
              alert('签到失败:'.response.data.message);
            }
          }, function (response) {
            Basic.hide();
            console.log('error');
            console.log(response.data);
            alert('签到失败');
          }
        );


      }
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
          console.log(data);
          Basic.hide();
          angular.forEach(data, function (betting) {
            // var difference = betting.period - currentPeriod;
            if (betting.period != currentPeriod) {
              console.log("periodStatusDesc");
              console.log(Object.keys(betting));
              console.log(betting.periodStatusDesc);
              if (betting.periodStatus == 1) {
                var d1 = Date.parse(betting.periodStatusDesc);
                addPeriod(betting.periodDesc,d1.toString('dddd H:m') + '开奖');

              } else {
                addPeriod(betting.periodDesc,betting.periodStatusDesc);
              }

            }
            currentPeriod = betting.period;
            console.log(betting.numbers);
            bettings.push(betting);
          })
        });

        console.log(bettings);
      }

      function addPeriod(period, periodStatusDesc) {
        bettings.push({
          isPeriod: true,
          period: period,
          statusDesc: periodStatusDesc
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
  .controller('PickCtrl', function ($scope, params, Picks, $ionicPopup, $timeout, $ionicLoading,
                                    $ionicHistory, Basic, $window, $http, $filter, UserApi,
                                    $cordovaDeviceMotion,$ionicPlatform, $cordovaVibration) {


    $scope.reds = Picks.init_red();
    $scope.selectedReds = [];


    $scope.blues = Picks.init_blue();
    $scope.selectedBlues = [];

    $scope.bluestyle = "blue-dark";
    $scope.redstyle = "red-dark";

    $scope.period = Picks.current_period.toString();

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
    var totalSecs = Picks.endtime;
    console.log('totalSecs');
    console.log(totalSecs);
    $scope.onTimeout = function(){
      totalSecs -= 1;
      var hours = parseInt( totalSecs / 3600 );
      var minutes = parseInt( totalSecs / 60 ) % 60;
      var seconds = totalSecs % 60;
      $scope.endtime = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
      mytimeout = $timeout($scope.onTimeout,1000);
    }

    var mytimeout = $timeout($scope.onTimeout,1000);

    $scope.stop = function(){
      $timeout.cancel(mytimeout);
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

    $scope.options = {
      frequency: 500, // Measure every 100ms
      deviation : 29  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
    };

    // Current measurements
    $scope.measurements = {
      x : null,
      y : null,
      z : null,
      timestamp : null
    }

    // Previous measurements
    $scope.previousMeasurements = {
      x : null,
      y : null,
      z : null,
      timestamp : null
    }

    // Watcher object
    $scope.watch = null;

    // Start measurements when Cordova device is ready
    $ionicPlatform.ready(function() {
      //Start Watching method
      $scope.startWatching = function() {
        console.log('startWatching');
        // Device motion configuration
        $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);

        // Device motion initilaization
        $scope.watch.then(null, function(error) {
          console.log(error);
        },function(result) {

          // Set current data
          $scope.measurements.x = result.x;
          $scope.measurements.y = result.y;
          $scope.measurements.z = result.z;
          $scope.measurements.timestamp = result.timestamp;

          // Detecta shake
          $scope.detectShake(result);

        });
      };

      // Stop watching method
      $scope.stopWatching = function() {
        $scope.watch.clearWatch();
      }

      // Detect shake method
      $scope.detectShake = function(result) {

        //Object to hold measurement difference between current and old data
        var measurementsChange = {};

        // Calculate measurement change only if we have two sets of data, current and old
        if ($scope.previousMeasurements.x !== null) {
          measurementsChange.x = Math.abs($scope.previousMeasurements.x, result.x);
          measurementsChange.y = Math.abs($scope.previousMeasurements.y, result.y);
          measurementsChange.z = Math.abs($scope.previousMeasurements.z, result.z);
        }

        // If measurement change is bigger then predefined deviation
        if (measurementsChange.x + measurementsChange.y + measurementsChange.z > $scope.options.deviation) {
          $scope.stopWatching();  // Stop watching because it will start triggering like hell
          // alert('Shake detected'); // shake detected
          $cordovaVibration.vibrate(50);
          $scope.randomSelected();
          setTimeout($scope.startWatching(), 3000);  // Again start watching after 1 sex

          // Clean previous measurements after succesfull shake detection, so we can do it next time
          $scope.previousMeasurements = {
            x: null,
            y: null,
            z: null
          }

        } else {
          // On first measurements set it as the previous one
          $scope.previousMeasurements = {
            x: result.x,
            y: result.y,
            z: result.z
          }
        }

      }

      $scope.startWatching();

    });

    $scope.$on('$ionicView.beforeLeave', function(){
      $scope.watch.clearWatch(); // Turn off motion detection watcher
    });


  })
  .controller('WebviewCtrl', function ($scope, WebviewService, $sce) {

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

    $scope.url = WebviewService.getLink();
    $scope.cTitle = WebviewService.getTitle();
    console.log($scope.url);

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
        $localForage.setItem('authKey', response.data.user.auth_key).then(function (err) {
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
