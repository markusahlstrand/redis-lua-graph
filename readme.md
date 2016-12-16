This is a cache for relational data that uses a directed graph to keep track of the dependencies. As cache entries may be depending on some related entities but not all it's possible to select which relations to track using pattern matching.

The envisioned solution would be to write the graph in lua so that it can be executed on redis, but we'll start with a raw javascript implementation to test the logic.

## Dependencies

A node can both have a dependency on a specific other node, so for example
```
a1 > b1
```

If B is removed then the cache entries for both A and B are removed as well.

It is also possible to have dependencies on a type of nodes, so if a1 is node instance and A the node type the cache for a1 would be removed if an additional node b2 was added to the graph above

```
a1 > b1 | b2
```

## Model

As a first attempt we'll use the names edges and vertexes to describe the entities. Each vertex has an hashmap of cache-entries which each can have a pattern assign to them describing which relations should cause the cache to invalidate.

If we for instance have a users and comments in a system, and we would like to cache a list of the comments that a user did. The dependencies would then be:

```
comment > user > feed
```

and the cache dependency from the user to the feed would have the relation type `comment` as it should be invalidated if there's a new comment.

If there's a new comment added the user node the change would propagate up through the dependencies and invalidate the feed cache. Note that any caches registered directly on the user won't be invalidated as the user hasn't been updated.s

### Directions of edges

It is only possible to traverse the graph in one direction. The direction of the edges are always upwards in the graph, so they point from children to parents

## Invalidation

If we have a distributed database as a backend there's a risk that the cache is repopulated with old data after a cache entry is invalidated. One solution to mitigate this would be to write a invalidation-date for the invalidated entries so that we can verify that the new data is freshed that the old entry