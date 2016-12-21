'use strict';

const assert = require('assert');

function runTestsForGraph(createGraph, name) {
  describe(name, function () {
    let graph;

    beforeEach(() => {
      return createGraph()
        .then(newGraph => {
          graph = newGraph;
        })
    });

    it("should add a cache entry and retrieve it", function () {
      const expected = "testValue";

      return graph.createVertex({key: "testName", value: expected, type: "TestType"})
        .then(() => graph.getVertex("testName", "TestType"))
        .then(value => assert.equal(value, expected));
    });

    it("should remove a single value", function () {
      return graph.createVertex({key: "testName", value: "testValue", type: "TestType"})
        .then(() => graph.removeVertex("testName"))
        .then(() => graph.getVertex("testName"))
        .then(value => assert.equal(value, undefined));
    });

    it("should add two nodes with a cache dependency", function () {
      return graph.create({
        vertices: [["sourceNode", "testValueA", "A"], ["destinationNode", "testValueB", "B"]],
        edges: [["sourceNode", "A", "destinationNode", "B"]] // A  has a dependency on B
      })
        .then(() => {
          return graph.getVertex("sourceNode", "A")
        })
        .then(value => assert.equal(value, "testValueA"))
        .then(() => graph.getVertex("destinationNode", "B"))
        .then(value => assert.equal(value, "testValueB"))
        .then(() => graph.getEdges("sourceNode", "A"))
        .then(value => {
          assert.equal(value.B.destinationNode, "all")
        });
    });

    it("should remove a cache entry if one of the dependencies are removed", function () {
      return graph.create({
        vertices: [["sourceNode", "testValueA", "A"], ["b", "destinationNode", "B"]],
        edges: [["sourceNode", "A", "destinationNode", "B"]]
      })
        .then(() => graph.remove("sourceNode", "A"))
        .then(() => graph.getVertex("destinationNode", "B"))
        .then(value => assert.equal(value, null));
    });

    it("should remove a cache entry if a new dependency is added two steps away and that matches the edge pattern", function () {
      return graph.create({
        vertices: [["episode", "testValueEpisode", "Episode"], ["show", "testValueShow", "Show"]],
        edges: [["episode", "Episode", "show", "Show", "MediaFile"]]
      })
        .then(() => {
          return graph.create({
            vertices: [["mediaFile", "testValueMediaFile", "MediaFile"]],
            edges: [["mediaFile", "MediaFile", "episode", "Episode"]]
          })
        })
        .then(() => {
          return graph.getVertex("show", "Show");
        })
        .then(value => assert.equal(value, null));
    });

    it("should not remove a cache entry if a new dependency is added two steps away and it does not match the edge pattern", function () {

      return graph.create({
        vertices: [["episode", "testValueEpisode", "Episode"], ["show", "testValueShow", "Show"]],
        edges: [["episode", "Episode", "show", "Show", "OtherDependency"]]
      })
        .then(() => {
          return graph.create({
            vertices: [["mediaFile", "testValueMediaFile", "MediaFile"]],
            edges: [["mediaFile", "MediaFile", "episode", "Episode"]]
          })
        })
        .then(() => {
          return graph.getVertex("show", "Show");
        })
        .then(value => {
          assert.equal(value, "testValueShow");
        });
    });

    it("should remove a cache entry if a new dependency is added three steps away and that matches the edge pattern", function () {
      return graph.create({
        vertices: [["episode", "testValueEpisode", "Episode"], ["show", "testValueShow", "Show"], ["rss", "testValueRss", "Rss"]],
        edges: [["episode", "Episode", "show", "Show"],["show", "Show", "rss", "Rss", "Episode:MediaFile"]]
      })
        .then(() => {
          return graph.create({
            vertices: [["mediaFile", "testValueMediaFile", "MediaFile"]],
            edges: [["mediaFile", "MediaFile", "episode", "Episode"]]
          })
        })
        .then(() => {
          return graph.getVertex("rss", "Rss");
        })
        .then(value => {
          assert.equal(value, null);
        });
    });
  });
}

module.exports = {
  runTestsForGraph
};