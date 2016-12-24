-- Removed a vertex and all edges connected to it
local function removeVertexAndEdges(key)
	local fieldNames = redis.call("HKEYS", key .. ":edges");
	for edgeKey in ipairs(fieldNames) do
		removeVertexAndEdges(edgeKey)
	end

	redis.call("DEL", key .. ":edges");
	redis.call("DEL", key);
end

removeVertexAndEdges(KEYS[1]);