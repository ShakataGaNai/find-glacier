// Setup our key variables and load some modules
var AWS = require('aws-sdk');
var Q = require('q');
AWS.config.loadFromPath("./config.json");
var s3 = new AWS.S3();
var s3x = new Array();
s3x['us-east-1'] = new AWS.S3({endpoint: 'https://s3.amazonaws.com'});
var allBucket = new Array();

// **** Configure me! ****
var debug = false;
var glacierOnly = true;
// **** End Configure me! ****

// **** Main code loop ****
 listTheBuckets()
  .then(getBucketLocale)
  .then(listAll)
// **** End main loop ****


// **** Functions start here ****
function printMe(){
  // Function used for debug only
  var deferred = Q.defer();
  loggit("printMe()");
  loggit(allBucket);
  deferred.resolve();
  return deferred.promise;
}

function listTheBuckets(){
    // Fetches a list of all S3 buckets.

    var deferred = Q.defer();
    loggit("listTheBuckets()");
    s3.listBuckets(function (err, data) {

    if (err) { loggit("Error:", err); }
    else {
      for (var index in data.Buckets) {
        var bucket = data.Buckets[index];
        allBucket[bucket.Name] = true;
      }
    }
  deferred.resolve();
  });
  return deferred.promise;
}

function getBucketLocale(){
  // Takes the list of S3 buckets, figures out where they are
  //   and opens a connection to those S3 end points.

  loggit("getBucketLocale()");
  var deferred = Q.defer();
  var areWeThereYet = 0;
  Object.keys(allBucket).forEach(function(name) {

    areWeThereYet++;
    s3.getBucketLocation({Bucket: name}, function(err3, data3) {
      if(err3){loggit(err3);}

      if(data3.LocationConstraint.length > 1 && !s3x[data3.LocationConstraint]){
        // Do we already have this S3 connection open? If not, open it.
        s3x[data3.LocationConstraint] = new AWS.S3({endpoint: 'https://s3-'+data3.LocationConstraint+'.amazonaws.com'});
        loggit("Opened new S3x " + data3.LocationConstraint);
      }

      if(data3.LocationConstraint.length > 1){
        // Store the location with the name.
        allBucket[name] = data3.LocationConstraint;
      }else{
        allBucket[name] = "us-east-1";
      }
      areWeThereYet--;
      if(areWeThereYet == 0){
        loggit("getBucketLocale()-resolve()");
        deferred.resolve();
      }
    }); //End s3.getBucketLocation
  }); //End forEach
  loggit("leaving getBucketLocale()");
  return deferred.promise;
}

function listAll(){
  // Pull a list of every S3 "object" (file) in every bucket

  loggit("listAll()");
  var deferred = Q.defer();
  var areWeThereYet = 0;

  Object.keys(allBucket).forEach(function(name) {
    // Iterate through our list of buckets
    areWeThereYet++;
    s3x[allBucket[name]].listObjects({Bucket: name}, function(err2, objdata) {
      if(err2){
        loggit(name +" -- " + allBucket[name] + " -- " + err2);
      }else{
        if(objdata.Contents.length>0){
          for(var a=0;a<objdata.Contents.length;a++){
            if(glacierOnly && objdata.Contents[a].StorageClass == "GLACIER"){
              //If we're in glacierOnly mode and is a glacier file - print
              console.log("s3://"+allBucket[name]+"/"+name+"/"+objdata.Contents[a].Key+" -- "+objdata.Contents[a].StorageClass);
            }else if(!glacierOnly){
              //We're not in glacierOnly mode - print
              console.log("s3://"+allBucket[name]+"/"+name+"/"+objdata.Contents[a].Key+" -- "+objdata.Contents[a].StorageClass);
            }
          }
        }else{
          loggit("s3://"+allBucket[name]+"/"+name+"/ -- BUCKET EMPTY");
        }
      }
      areWeThereYet--;
      if(areWeThereYet == 0){
        loggit("listAll()-resolve()");
        deferred.resolve();
      } //end if
    }); //end listObjects
  }); //end forEach
  loggit("leaving listAll()");
  return deferred.promise;
} //end function

function loggit(message){
  // Debugging ftw
  if(debug){console.log(message);}
}
