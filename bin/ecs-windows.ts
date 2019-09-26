#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { EcsWindowsStack } from '../lib/ecs-windows-stack';

const app = new cdk.App();
new EcsWindowsStack(app, 'EcsWindowsStack');
