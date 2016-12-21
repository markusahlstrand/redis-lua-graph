'use strict';

const _ = require('lodash');

module.exports = class Graph {
  constructor() {
    this.edges = {};
    this.vertices = {};
  }

  create(options) {
    const promises = [];

    if (options.vertices && Array.isArray(options.vertices)) {
      options.vertices.forEach(item => {
        const vertex = {
          key: item[0],
          value: item[1],
          type: item[2]
        };
        promises.push(this.createVertex(vertex));
      })
    }

    if (options.edges && Array.isArray(options.edges)) {
      options.edges.forEach(item => {
        const edge = {
          source: item[0],
          sourceType: item[1],
          destination: item[2],
          destinationType: item[3],
          pattern: item[4]
        };
        promises.push(this.createEdge(edge));
      })
    }

    // Trusting that everything executes in the correct order..
    return Promise.all(promises);
  }

  createEdge(options) {
    _.set(this.edges, `${options.sourceType}.${options.source}.${options.destinationType}.${options.destination}`, options.pattern || "all");
    return this.propagateUpdate(options.destination, options.destinationType, options.sourceType);
  }

  createVertex(options) {
    _.set(this.vertices, `${options.type}.${options.key}`, options.value);
    return Promise.resolve();
  }

  get(key, type) {
    const vertex = _.get(this.vertices, `${type}.${key}`);
    const edges = _.get(this.edges, `${type}.${key}`);
    return Promise.resolve({
      vertex: vertex,
      edges: edges
    });
  }

  getEdges(key, type) {
    return Promise.resolve(_.get(this.edges, `${type}.${key}`));
  }

  getVertex(key, type) {
    return Promise.resolve(_.get(this.vertices, `${type}.${key}`));
  }

  remove(key, type) {
    return this.getEdges(key, type)
      .then((edges) => {
        const promises = [];

        if (edges) {
          for(var edgeType in edges) {
            for(var edgeKey in edges[edgeType]) {
              promises.push(this.remove(edgeKey, edgeType));
            }
          }
        }
        promises.push(this.removeVertex(key, type));
        return Promise.all(promises);
      })
  }

  removeVertex(key, type) {
    _.unset(this.vertices, `${type}.${key}`);
    _.unset(this.edges, `${type}.${key}`);
    return Promise.resolve();
  }

  propagateUpdate(key, type, pattern) {
    // const self = this;
    const currentType = type;

    this.getEdges(key, type)
      .then(edges => {
        const promises = [];

        if(edges) {
          _.forEach(edges, (values, edgeType) => {
            _.forEach(values, (edgePattern, edgeKey) => {
              if(edgePattern === pattern) {
                promises.push(this.removeVertex(edgeKey, edgeType));
              } else {
                promises.push(this.propagateUpdate(edgeKey, edgeType, currentType + ':' + pattern));
              }
            });
          });
        }

        return Promise.all(promises);
      })
  }
};