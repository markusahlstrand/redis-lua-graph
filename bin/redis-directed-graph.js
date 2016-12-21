'use strict';

const _ = require('lodash');

module.exports = class RedisDirectedGraph {
  constructor(options) {
    this.client = options.client;
  }

  create(options) {
    const promises = [];

    if (options.vertices && Array.isArray(options.vertices)) {
      const verticesArray = options.vertices.map(item => {
        return [`${item[2]}:${item[0]}`, item[1]];
      });
      promises.push(new Promise((resolve, reject) => {
        this.client.mset(_.flatten(verticesArray), err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }));
    }

    if (options.edges && Array.isArray(options.edges)) {
      const edgesByVertex = _.groupBy(options.edges, item => `${item[1]}:${item[0]}`);

      _.forEach(edgesByVertex, (edges, key) => {
        const edgeArray = edges.map(item => {
          const source = `${item[3]}:${item[2]}`;
          // The type indicates the type of dependency. Guess this should really be passed in as a separate parameter
          const type = item[4] || "all";
          return [source, type];
        });

        edgeArray.splice(0, 0, [`${key}:edges`]);

        promises.push(new Promise((resolve, reject) => {
          this.client.hmset(_.flatten(edgeArray), err => {
            if (err) {
              return reject(err);
            }

            var propagePromises = [];
            edges.forEach(edge => {
              propagePromises.push(this.propagateUpdate(edge[2], edge[3], edge[1]));
            });

            Promise.all(propagePromises)
              .then(resolve)
              .catch(reject);
          });
        }));
      });
    }

    return Promise.all(promises);
  }

  createVertex(options) {
    return new Promise((resolve, reject) => {
      this.client.set(`${options.type}:${options.key}`, options.value, err => {
        if (err) {
          throw err;
        }

        this.propagateUpdate(options.destination, options.destinationType, options.sourceType)
          .then(() => {
            resolve();
           })
          .catch(reject);
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

  getVertex(key, type) {
    return new Promise((resolve) => {
      this.client.get(`${type}:${key}`, (err, result) => {
        if (err) {
          throw err;
        }

        resolve(result);
      });
    });
  }

  remove(key, type) {
    return this.getEdges(key, type)
      .then((edges) => {
        const promises = [];

        if (edges && Array.isArray(edges)) {
          edges.forEach(edge => {
            promises.push(this.remove(edge.destination, edge.type));
          });
        }
        promises.push(this.removeVertex(key, type));
        return Promise.all(promises);
      })
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

  propagateUpdate(key, type, pattern) {
    const currentType = type;

    return this.getEdges(key, type)
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