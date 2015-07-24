# find-glacier
A quick nodejs script to find all files stored in [AWS Glacier](http://aws.amazon.com/glacier/) (or optionally all files in S3).

## How to use
* Copy config-example.json to config.json
* Login to AWS console
* Goto IAM
* Create a new user, save the access key & secret to config.json
 * NOTE: Do not change the region from us-east-1.
* Attach the policy "AmazonS3ReadOnlyAccess" to the user
* Install the dependencies: `$ npm install`
* Run the app: `$ node app.js`
* Change `var glacierOnly = true;` to `false` to list ALL S3 files.

## License
See LICENSE file
