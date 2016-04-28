angular.module('starter.services', [])

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  })

  .factory("UserApi", function (params, $http, $window, $resource, $localForage) {
    return {
      post:function (url, data, successCallback, failCallback) {
        $localForage.getItem('authKey').then(function (token) {
          console.log(token);
          // token = 'auZbDD2Wm9h4UbxBU0AdmroKbAChTwo2';
          // if (data)
          var req = {
            method: 'POST',
            url: url,
            headers: {
              "Content-Type":"application/json",
              "Authorization": "Bearer " + token
            },
            data: data
          }
          $http(req).then(successCallback, failCallback);
        });

      },
      get:function (url, data, successCallback, failCallback) {
        $localForage.getItem('authKey').then(function (token) {
          // if (data)
          var req = {
            method: 'GET',
            url: url,
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            },
            data: data
          }
          $http(req).then(successCallback, failCallback);
        })
      },
      resource:function (url, method, allCallback) {
        $localForage.getItem('authKey').then(function (token) {
          // if (data)
          $http.defaults.headers.common["Authorization"] = "Bearer " + token;
          var reqs = $resource(url);
          reqs.query().$promise.then(allCallback);
        })
      }

    };

  })

  .factory("Basic", function (params, $ionicLoading) {
    return {
      show: function () {
        $ionicLoading.show(params.LOADING_CONFIG); //options default to values in $ionicLoadingConfig
      },
      hide: function () {
        $ionicLoading.hide();
      }

    };

  })

  .factory("Bettings", function () {
    return {};
  })
  .factory("History", function () {
    return {};
  })
  .factory("Picks", function () {
    return {
      current_period:'',
      init_red: function () {
        var input = [];
        var tmp = [];
        for (var i = 1; i <= 40; i++) {
          if (i < 10) {
            tmp.push('0' + i);
          } else {
            tmp.push(i);
          }
          if (i % 8 == 0) {
            input.push(tmp);
            tmp = [];
          }
        }
        input.push(tmp);
        return input;
      },

      init_blue: function () {
        var input = [];
        var tmp = [];
        for (var i = 1; i <= 16; i++) {
          if (i < 10) {
            tmp.push('0' + i);
          } else {
            tmp.push(i);
          }
          if (i % 8 == 0) {
            input.push(tmp);
            tmp = [];
          }
        }
        input.push(tmp);
        return input;
      },
      random_nums: function (count, max) {
        var arr = [];
        while (arr.length < count) {
          var randomnumber = Math.ceil(Math.random() * max)
          var found = false;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] == randomnumber) {
              found = true;
              break
            }
          }
          if (!found) {
            if (randomnumber < 10) {
              arr[arr.length] = '0' + randomnumber;
            } else {
              arr[arr.length] = randomnumber;
            }

          }
        }
        return arr;
      },
      verify: function (blues, reds) {
        if (blues.length < 1) {
          return {
            status: -1,
            message: "蓝球至少选择一个",
          };
        }
        if (reds.length < 5) {
          return {
            status: -1,
            message: "红球至少选择一个",
          };
        }
        return {
          status: 0,
          message: "",
        };

      },
      submit: function () {


      },
      in_array: function (item, array) {
        return (-1 !== array.indexOf(item));
      }
    };
  });
