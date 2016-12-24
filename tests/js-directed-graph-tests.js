"use strict";

const redis = require('redis');
const graphTests = require('./graph.tests');

const Graph = require('../bin/js-directed-graph');

function createGraph() {
  return Promise.resolve(new Graph());
}

graphTests.runTestsForGraph(createGraph, "jsDirectedGraph");
