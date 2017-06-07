#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('app:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */
 
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8085;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';


app.listen(server_port,server_ip_address);