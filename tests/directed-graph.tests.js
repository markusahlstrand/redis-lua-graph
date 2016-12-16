// /*
// "use strict";
//
// const assert = require('assert');
// const directedGraph = require('../bin/directed-graph');
//
// describe("directedGraph", function () {
//   beforeEach(() => {
//     directedGraph.removeAll();
//   });
//
//   it("should add a cache entry and retrieve it", function () {
//     const expected = "testValue";
//
//     return directedGraph.addVertex({key: "testName", value: expected})
//       .then(() => directedGraph.getVertex("testName"))
//       .then(value => assert.equal(value, expected));
//   });
//
//   it("should remove a single value", function () {
//     return directedGraph.addVertex({key: "testName", value: "testValue"})
//       .then(() => directedGraph.removeVertex("testName"))
//       .then(() => directedGraph.getVertex("testName"))
//       .then(value => assert.equal(value, undefined));
//   });
//
//   it("should add two nodes with a cache dependency", function () {
//     return directedGraph.add({
//       verticis: [["a", "a"], ["b", "b"]],
//       edges: [["a", "b"]]
//     })
//       .then(() => directedGraph.getVertex("a"))
//       .then(value => assert.equal(value, "a"))
//       .then(() => directedGraph.getVertex("b"))
//       .then(value => assert.equal(value, "b"))
//       .then(() => directedGraph.getEdges("b"))
//       .then(value => assert.equal(value[0].destination, "a"));
//   });
//
//   it("should remove a cache entry if one of the dependencies are removed", function () {
//     return directedGraph.add({
//       verticis: [["a", "a"], ["b", "b"]],
//       edges: [["a", "b"]]
//     })
//       .then(() => directedGraph.remove("b"))
//       .then(() => directedGraph.getVertex("a"))
//       .then(value => assert.equal(value, null));
//   });
//
//
//   it("should remove a cache entry if a new dependency is added two steps away and that matches the edge pattern", function () {
//     return directedGraph.add({
//       verticis: [["a1", "a1"], ["b1", "b1"]],
//       edges: [["a1", "b1", "C"]]
//     })
//       .then(() => directedGraph.add({
//         verticis: [["c1", "c1", "C"]],
//         edges: [["b1", "c1"]]
//       }))
//       .then(() => directedGraph.getVertex("a1"))
//       .then(value => assert.equal(value, null));
//   });
//
//   it("should not remove a cache entry if a new dependency is added two steps away and it does not match the edge pattern", function () {
//     return directedGraph.add({
//       verticis: [["a1", "a1"], ["b1", "b1"]],
//       edges: [["a1", "b1", "D"]]
//     })
//       .then(() => directedGraph.add({
//         verticis: [["c1", "c1", "C"]],
//         edges: [["b1", "c1"]]
//       }))
//       .then(() => directedGraph.getVertex("a1"))
//       .then(value => assert.equal(value, "a1"));
//   });
//
//   it("should remove a cache entry if a new dependency is added three steps away and that matches the edge pattern", function () {
//     return directedGraph.add({
//       verticis: [["a1", "a1", "A"], ["b1", "b1", "B"], ["c1", "c1", "C"]],
//       edges: [["a1", "b1", "D:C"], ["b1", "c1"]]
//     })
//       .then(() => directedGraph.add({
//         verticis: [["d1", "d1", "D"]],
//         edges: [["c1", "d1"]]
//       }))
//       .then(() => directedGraph.getVertex("a1"))
//       .then(value => assert.equal(value, null));
//   });
// });*/
