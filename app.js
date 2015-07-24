var AWS = require('aws-sdk');
var Q = require('q');
AWS.config.loadFromPath("./config.json");
var s3 = new AWS.S3();
var s3x = new Array();
s3x['us-east-1'] = new AWS.S3({endpoint: 'https://s3.amazonaws.com'});
var allBucket = new Array();

// Configure me!
var debug = false;
var glacierOnly = true;
// End Configure me!

 listTheBuckets()
  .then(getBucketLocale)
  .then(listAll)

// **************************
function printMe(){
  // Function used for debug only
  var deferred = Q.defer();
  loggit("printMe()");
  loggit(allBucket);
  deferred.resolve();
  return deferred.promise;
}

function getBucketLocale(){
  loggit("getBucketLocale()");
  var deferred = Q.defer();
  var areWeThereYet = 0;
  Object.keys(allBucket).forEach(function(name) {

    areWeThereYet++;
    s3.getBucketLocation({Bucket: name}, function(err3, data3) {
      if(err3){loggit(err3);}

      if(data3.LocationConstraint.length > 1 && !s3x[data3.LocationConstraint]){
        s3x[data3.LocationConstraint] = new AWS.S3({endpoint: 'https://s3-'+data3.LocationConstraint+'.amazonaws.com'});
        loggit("Opened new S3x " + data3.LocationConstraint);
      }

      if(data3.LocationConstraint.length > 1){
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

function listTheBuckets(){
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

function listAll(){
  loggit("listAll()");
  var deferred = Q.defer();
  var areWeThereYet = 0;
  Object.keys(allBucket).forEach(function(name) {
    areWeThereYet++;
    s3x[allBucket[name]].listObjects({Bucket: name}, function(err2, objdata) {
      if(err2){
        loggit(name +" -- " + allBucket[name] + " -- " + err2);
      }else{
        if(objdata.Contents.length>0){
          for(var a=0;a<objdata.Contents.length;a++){
            if(glacierOnly && objdata.Contents[a].StorageClass == "GLACIER"){
              console.log("s3://"+allBucket[name]+"/"+name+"/"+objdata.Contents[a].Key+" -- "+objdata.Contents[a].StorageClass);
            }else if(!glacierOnly){
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
  if(debug){console.log(message);}
}
