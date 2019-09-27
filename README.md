# CDK Test
This is just a quick little test to see windows containers running in ECS. Its probably going to age like milk.

Note, once deployed you will need to edit the task definition to use the <default> network mode. This option is currently not supported in the CDK. Once done you will need to also update the service to use the latest task definition. 
# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
