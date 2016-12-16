'use strict';

const graph = require('directed-graph');

function get(key) {
  return graph.getVertex(key);
}

function remove(key) {
  return graph.remove(key);
}

function set(key, value, dependencies) {
  return graph.add({
    verticis: [[key, value]],
    edges: dependencies
  })
}

module.exports = {
  get,
  remove,
  set
};