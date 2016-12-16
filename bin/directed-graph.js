'use strict';

// This is a very simple implementation of the directed graph with in-memory storage try out the concept

const data = {};

function add(options) {
  const promises = [];

  if (options.verticis && Array.isArray(options.verticis)) {
    options.verticis.forEach(item => {
      const vertex = {
        key: item[0],
        value: item[1],
        type: item[2]
      };
      promises.push(addVertex(vertex));
    })
  }

  if (options.edges && Array.isArray(options.edges)) {
    options.edges.forEach(item => {
      const edge = {
        parent: item[0],
        child: item[1],
        type: item[2]
      };
      promises.push(addEdge(edge));
    })
  }

  // Trusting that everything executes in the correct order..
  return Promise.all(promises);
}

function propagateUpdate(key, type) {
  get(key)
    .then(node => {
      const promises = [];

      if(node.edges && Array.isArray(node.edges)) {
        node.edges.forEach(edge => {
          if(type === edge.type) {
            promises.push(removeVertex(edge.destination));
          } else {
            promises.push(propagateUpdate(edge.destination, type + ':' + node.type));
          }
        })
      }

      return Promise.all(promises);
    })
}

function addEdge(options) {
  get(options.source)
    .then(vertex => {
      const promises = [];

      vertex.edges = vertex.edges || [];
      vertex.edges.push({
        parent: options.destination,
        type: options.type
      });
      promises.push(propagateUpdate(options.destination, vertex.type));

      return Promise.all(promises);
    })
}

function addVertex(options) {
  data[options.key] = {
    value: options.value,
    type: options.type
  };
  return Promise.resolve();
}

/**
 * Get's a vertex with it's edges
 * @param key
 */
function get(key) {
  if (!data[key]) {
    return null;
  }
  return Promise.resolve(data[key]);
}

function getEdges(key) {
  if (!data[key]) {
    return Promise.resolve(null);
  }
  return Promise.resolve(data[key].edges);
}

function getVertex(key) {
  if (!data[key]) {
    return null;
  }
  return Promise.resolve(data[key].value);
}

function remove(key) {
  return getEdges(key)
    .then((edges) => {
      const promises = [];

      if (edges && Array.isArray(edges)) {
        edges.forEach(edge => {
          promises.push(remove(edge.destination));
        });
      }
      promises.push(removeVertex(key));
      return Promise.all(promises);
    })
}

function removeAll() {
  for (let prop in data) {
    delete data[prop];
  }
}

function removeVertex(key) {
  delete data[key];
  return Promise.resolve();
}

module.exports = {
  add,
  addEdge,
  addVertex,
  get,
  getEdges,
  getVertex,
  remove,
  removeAll,
  removeVertex,
};