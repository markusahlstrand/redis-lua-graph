'use strict';

const _ = require('lodash');
const fs = require('fs');
const Shavaluator = require('redis-evalsha');


function loadLua(filename) {
  return fs.readFileSync(`./bin/lua/${filename}.lua`, 'utf8');
}

function createVertexScript() {
  return loadLua('createVertex');
}

function getVertexScript() {
  return loadLua('getVertex');
}

module.exports = class RedisDirectedGraph {
  constructor(options) {
    this.client = options.client;
    this.shavaluator = new Shavaluator(this.client);
    this.shavaluator.add('createVertex', createVertexScript());
    this.shavaluator.add('getVertex', getVertexScript());
  }

  createVertex(options) {
    return new Promise((resolve, reject) => {
      this.shavaluator.exec('createVertex', [`${options.type}:${options.key}`, options.value], [], (err, result) => {
        if(err) return reject(err);

        resolve(result);
      });
    });
  }

  getVertex(key, type) {
    return new Promise((resolve, reject) => {
      this.shavaluator.exec('getVertex', [`${type}:${key}`], [], (err, result) => {
        if(err) return reject(err);

        resolve(result);
      });
    });
  }
};