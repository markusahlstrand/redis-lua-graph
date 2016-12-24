'use strict';

const _ = require('lodash');
const fs = require('fs');
const Shavaluator = require('redis-evalsha');


function loadLua(filename) {
  return fs.readFileSync(`./bin/lua/${filename}.lua`, 'utf8');
}

const scripts = {
  createVertices: loadLua('createVertices'),
  createVerticesAndEdges: [
    loadLua('removeVertexFunction'),
    loadLua('propagateUpdate'),
    loadLua('createVerticesAndEdges')].join('\n'),
  getVertex: loadLua('getVertex'),
  removeVertex: [
    loadLua('removeVertexFunction'),
    loadLua('removeVertex')].join('\n')
};

module.exports = class RedisDirectedGraph {
  constructor(options) {
    this.client = options.client;
    this.shavaluator = new Shavaluator(this.client);

    for (var prop in scripts) {
      this.shavaluator.add(prop, scripts[prop]);
    }
  }

  create(options) {
    return new Promise((resolve, reject) => {
      const vertices = options.vertices.map(item => {
        return {
          key: `${item[2]}:${item[0]}`,
          value: item[1]
        }
      });

      const edges = options.edges.map(item => {
        return {
          key: `${item[1]}:${item[0]}:edges`,
          value: `${item[3]}:${item[2]}:${item[4]||'all'}`
        }
      });

      const verticesAndEdges = vertices.concat(edges);
      const keys = verticesAndEdges.map(v => v.key);
      const values = verticesAndEdges.map(v => v.value);

      this.shavaluator.exec('createVerticesAndEdges', keys, values, (err, result) => {
        if(err) return reject(err);

        resolve(result);
      });
    });
  }

  createVertex(options) {
    return new Promise((resolve, reject) => {
      this.shavaluator.exec('createVertices', [`${options.type}:${options.key}`], [options.value], (err, result) => {
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

  getEdges(vertexKey, vertexClass) {
    return new Promise((resolve) => {
      this.client.hgetall(`${vertexClass}:${vertexKey}:edges`, (err, result) => {
        if (err) {
          throw err;
        }

        const edges = {};

        _.forEach(result, (value, key) => {
          _.set(edges, key.replace(':','.'), value);
        });

        resolve(edges);
      });
    });
  }

  remove(key, type) {
    return new Promise((resolve, reject) => {
      this.shavaluator.exec('removeVertex', [`${type}:${key}`], [], (err, result) => {
        if(err) return reject(err);

        resolve(result);
      });
    });
  }

  removeVertex(key, type) {
    return new Promise((resolve, reject) => {
      this.client.del(`${type}:${key}`, err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
};