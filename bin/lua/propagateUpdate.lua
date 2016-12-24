local function propagateUpdate(key, pattern)
    print("key:" .. key);
    print("pattern:" .. pattern);
    local fieldNames = redis.call("HKEYS", key .. ":edges");

    for _, fieldName in pairs(fieldNames) do
        local fieldValue = redis.call("HGET", key .. ":edges", fieldName);
        if fieldValue == pattern then
            -- this is defined in the remove vertex file
            removeVertexAndEdges(fieldName)
        else
            local _, _, currentType = string.find(key, "(%a+):")
            propagateUpdate(fieldName, currentType .. ":" .. pattern)
        end
    end
end