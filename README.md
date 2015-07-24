# find-glacier
Just a quick script to find all the data stored in AWS Glacier

## How to use
* Login to AWS console
* Goto IAM
* Create a new user, save the access key & secret
* Attach the policy "AmazonS3ReadOnlyAccess" to the user
* Install the dependencies: `$ npm install`
* Run the app: `$ node app.js`
