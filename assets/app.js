$(document).ready(function(){

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDXBthnjeKyGZKjSAxr8b3WQyzNEa7drzw",
    authDomain: "trainscheduler-4c309.firebaseapp.com",
    databaseURL: "https://trainscheduler-4c309.firebaseio.com",
    projectId: "trainscheduler-4c309",
    storageBucket: "",
    messagingSenderId: "651934899208"
  };
  firebase.initializeApp(config);

  setInterval(function(){
    $('.current-time').html(moment().format('hh:mm:ss A'))
  }, 1000);

 var dataRef = firebase.database();
 var fbTime = moment();
 var newTime;

 $('.submit').on('click', function(e) {

      e.preventDefault();

      trainName = $('#trainName').val().trim();
      trainDestination = $('#trainDestination').val().trim();
      trainTime = moment($('#firstTrain').val().trim(),"HH:mm").format("X");
      trainFreq = $('#trainFrequency').val().trim();

      var NewTrain={
            trainName: trainName,
            trainDestination: trainDestination,
            trainTime: trainTime,
            trainFreq: trainFreq,
            currentTime: fbTime,
      };

      databse.ref()child('trains').push(NewTrain);

      alert("Train Sucessfully Added");
      
      $("#trainName").val("");
      $("#trainDestination").val("");
      $("#trainTime").val("");
      $("trainFreq").val("");
      $("currentTime").val(fbTime);

});

  function timeUpdater() {
      dataRef.ref().child('trains').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          fbTime = moment().format('X');
          dataRef.ref('trains/' + childSnapshot.key).update({
          currentTime: fbTime,
          })
        })    
      });
    };

    setInterval(timeUpdater, 10000);

     dataRef.ref().child('trains').on('value', function(snapshot){
      $('tbody').empty();
      
      snapshot.forEach(function(childSnapshot){
        var trainClass = childSnapshot.key;
        var trainId = childSnapshot.val();
        var firstTimeConverted = moment.unix(trainId.trainTime);
        var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
        var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
        var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

        if(timeDiff >= 0) {
          newTime = null;
          newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');

        } else {
          newTime = null;
          newTime = firstTimeConverted.format('hh:mm A');
          timeDiffTotal = Math.abs(timeDiff - 1);
        }

        $('tbody').append("<tr class=" + trainClass + "><td>" + trainId.trainName + "</td><td>" +
          trainId.trainDestination + "</td><td>" + 
          trainId.trainFreq + "</td><td>" +
          newTime + "</td><td>" +
          timeDiffTotal + "</td><td><button class='edit btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-pencil'></i></button> <button class='delete btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-remove'></i></button></td></tr>");

    });
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

dataRef.ref().child('trains').on('child_changed', function(childSnapshot){
      
      var trainClass = childSnapshot.key;
      var trainId = childSnapshot.val();
      var firstTimeConverted = moment.unix(trainId.trainTime);
      var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
      var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
      var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

      if(timeDiff > 0) {
        newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');
      } else {
        newTime = firstTimeConverted.format('hh:mm A');
        timeDiffTotal = Math.abs(timeDiff - 1);
      } 

      $('.'+trainClass).html("<td>" + trainId.trainName + "</td><td>" +
        trainId.trainDestination + "</td><td>" + 
        trainId.trainFreq + "</td><td>" +
        newTime + "</td><td>" +
        timeDiffTotal + "</td><td><button class='edit btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-pencil'></i></button><button class='delete btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-remove'></i></button></td>");

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });


    $(document).on('click','.delete', function(){
      var trainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + trainKey).remove();
      $('.'+ trainKey).remove();
    });

    $(document).on('click','.edit', function(){
      editTrainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + editTrainKey).once('value').then(function(childSnapshot) {
        $('#trainName').val(childSnapshot.val().trainName);
        $('#trainDestination').val(childSnapshot.val().trainDestination);
        $('#firstTrain').val(moment.unix(childSnapshot.val().trainTime).format('HH:mm'));
        $('#trainFrequency').val(childSnapshot.val().trainFreq);
        $('#trainKey').val(childSnapshot.key);

      });
      
    });

  };

});


            

