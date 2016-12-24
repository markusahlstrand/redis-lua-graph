--- Creates multiple vertices and edges
for key,value in ipairs(KEYS) do
	if string.find(value, ":edges")~=nil then
		local _, _, itemKey, itemValue = string.find(ARGV[key], "(%a+:%a+):(.+)")
		redis.call("HSET", value, itemKey, itemValue)

		local _, _, sourceType = string.find(value, "(%a+):");
		-- This is defined in the propageUpdatefile
		print("Create edge: " .. value .. " -> " .. ARGV[key])
		propagateUpdate(itemKey, sourceType)
	else
		redis.call("SET", value, ARGV[key])
	end
end