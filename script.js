$("document").ready(function() {
  // Twitch API refrence used: https://dev.twitch.tv/docs/api/reference/
  const clientID = '1hlesnjwlm1we40h7oc549yq8dtzww';  
  const streamerUsers = [
    "OgamingSC2", "unrealengine", "freecodecamp", "ESL_SC2", "ninja", 
    "riotgames", "GamesDoneQuick", "dakotaz", "cretetion", "storbeck", 
    "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin", "comster404"
  ];
  
  function addStreamer(streamerElement) {

    var streamerItem = $("#st-template").clone();
    streamerItem.find(".st-link").text(streamerElement.channel);
    streamerItem.find(".st-link").attr("href", streamerElement.channelURL);
    streamerItem.find(".logo-img").attr("src", streamerElement.logoURL);  
    
    streamerItem.find(".gm-link").attr("href", streamerElement.gameURL); 
    streamerItem.find(".gm-link").text(streamerElement.status);

    if (streamerElement.streaming) {
      streamerItem.addClass("st-online");
    } else {
      streamerItem.addClass("st-offline");
    }
    streamerItem.toggle(true);

    $("#streamers").append(streamerItem);
  }  
  
  function getUsers(users) {   
    const usersRequest = users.map(function(user) {
      return 'login=' + user;
    }).join('&');  
    
    $.ajax({ 
      type: 'GET',
      url: `https://api.twitch.tv/helix/users?${usersRequest}`,
      headers: {
        'Client-ID': clientID
      },
      success: function (res) {
        getStreams(res.data);
      }
    });
  }
  
  function getStreams(usersInfo) {
    const streamsRequest = usersInfo.map(function(user) {
      return 'user_login=' + user.login;
    }).join('&');
    
    $.ajax({
      type: 'GET',
      url: `https://api.twitch.tv/helix/streams?${streamsRequest}`,
      headers: {
        'Client-ID': clientID
      },
      success: function (res) {

        const newUserData = usersInfo.map(function(user) {
          
          const found = res.data.find(function(element) {
            return element.user_id === user.id;
          });
          
          if (found) {
            user.streamInfo = found;
          } else {
            user.streamInfo = null;
          }

          return user;
        });

        getGameInfo(newUserData);
      }
    });
  }
  
  function getGameInfo(usersInfo) {
 
    let gameIDs = [] ;
    usersInfo.forEach(function(user) {
      if (user.streamInfo !== null) {
        gameIDs.push(user.streamInfo.game_id)
      }       
    });
    
    const gamesRequest = gameIDs.map(function(id) {
      return 'id=' + id;
    }).join('&');

    $.ajax({ 
      type: 'GET',
      url: `https://api.twitch.tv/helix/games?${gamesRequest}`,
      headers: {
        'Client-ID': clientID
      },
      success: function (res) {

        const newUserData = usersInfo.map(function(user) {
          if (user.streamInfo !== null) {            
            const found = res.data.find(function(element) {
              return element.id === user.streamInfo.game_id;
            });
            user.streamInfo.gameInfo = found;
          }
          
          return user;
        });
        
        processUserStreamData(newUserData);
      }      
    });    
  }

  function processUserStreamData(usersInfo) {
    usersInfo.forEach(function(user) {
      var streamerObj = {};
      streamerObj.channel = user.display_name;
      streamerObj.channelURL = "https://www.twitch.tv/" + user.login;

      if (user.streamInfo !== null) {
        streamerObj.streaming = true;
        streamerObj.status = user.streamInfo.gameInfo.name;
        streamerObj.gameURL = 'https://www.twitch.tv/directory/game/' + streamerObj.status;
        streamerObj.logoURL = user.profile_image_url;
      } else {
        streamerObj.streaming = false;
        streamerObj.logoURL = "https://dummyimage.com/50x50/ecf0e7/5c5457.jpg&text=offline";
        streamerObj.gameURL = '#';
      }
      addStreamer(streamerObj);
    });
  }
  
  getUsers(streamerUsers);  
});