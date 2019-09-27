import cdk = require('@aws-cdk/core');
import ecs = require('@aws-cdk/aws-ecs');
import ec2 = require('@aws-cdk/aws-ec2')
import auto_scaling = require('@aws-cdk/aws-autoscaling')
import { Port, Peer } from '@aws-cdk/aws-ec2';


export class EcsWindowsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "cluster", {
      clusterName: "ecs-windows",
    })

    const user_data = ec2.UserData.forWindows()
    user_data.addCommands(
      "Import-Module ECSTools",
      "Initialize-ECSAgent -Cluster 'ecs-windows' -EnableTaskIAMRole",
    )
    
    const asg = new auto_scaling.AutoScalingGroup(this, "win-ecs-asg", 
    {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      machineImage: ecs.EcsOptimizedImage.windows(ecs.WindowsOptimizedVersion.SERVER_2019),
      vpc: cluster.vpc,
      maxCapacity: 1,
      associatePublicIpAddress: true,
      vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC },
      userData: user_data
    })

    const security_group = new ec2.SecurityGroup(this, "win-ecs-security-group",
    {
      vpc: cluster.vpc
    })
    
    security_group.addIngressRule(ec2.Peer.ipv4("0.0.0.0/0"), ec2.Port.tcp(3389))
    security_group.addIngressRule(ec2.Peer.ipv4("0.0.0.0/0"), ec2.Port.tcp(8080))
    security_group.addIngressRule(ec2.Peer.ipv4("0.0.0.0/0"), ec2.Port.tcp(80))

    asg.addSecurityGroup(security_group)

    cluster.addAutoScalingGroup(asg)

    const task_definition = new ecs.Ec2TaskDefinition(this, "win-demo", 
    {
      networkMode: ecs.NetworkMode.NONE
    })


    const container = task_definition.addContainer("win-container-def",
    {
      image: ecs.ContainerImage.fromRegistry('microsoft/iis'),
      memoryLimitMiB: 128,
      entryPoint: ["powershell", "-Command"],
      command: ["New-Item -Path C:\\inetpub\\wwwroot\\index.html -ItemType file -Value '<html> <head> <title>Amazon ECS Sample App</title> <style>body {margin-top: 40px; background-color: #333;} </style> </head><body> <div style=color:white;text-align:center> <h1>Amazon ECS Sample App</h1> <h2>Congratulations!</h2> <p>Your application is now running on a container in Amazon ECS.</p>' -Force ; C:\\ServiceMonitor.exe w3svc"],
 
    })

    container.addPortMappings({
      protocol: ecs.Protocol.TCP,
      containerPort: 80,
      hostPort: 8080
    })
  }
}
