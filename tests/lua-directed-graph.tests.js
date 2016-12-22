"use strict";

const redis = require('redis');
const graphTests = require('./graph.tests');

const LuaGraph = require('../bin/lua-directed-graph');
const bluebird = require('bluebird');
const client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function createGraph() {
  return new Promise((resolve, reject) => {
    client.keys('*', (err, results) => {
      const graph = new LuaGraph({client: client});
      if(!results.length) {
        resolve(graph);
      }

      const promise = [];

      client.del(results, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(graph);
      })
    });
  });
}

graphTests.runTestsForGraph(createGraph, "luaDirectedGraph");