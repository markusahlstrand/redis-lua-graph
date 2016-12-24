for key,value in ipairs(KEYS)
do
   redis.call("set", value, ARGV[key]);
end