/**
 * @param { any } value 
 * @param { "number" | "string" | "boolean" | "function" | "list" | "dict" | "symbol" | "null" | "undefined" } type 
 * @returns {boolean}
 */
module.exports.compareType = (value, type)=>{
  let option = {
    "bigint":    (value)=>"number",
    "boolean":   (value)=>"boolean",
    "function":  (value)=>"function",
    "number":    (value)=>"number",
    "object":    (value)=>{
      if(Array.isArray(value))
        return "list"
      if(Object.isObject(value))
        return "dict"
      return "null"
    },
    "string":    (value)=>"string",
    "symbol":    (value)=>"symbol",
    "undefined": (value)=>"undefined"
  };
  if(! type)
    return option[typeof value](value);
  else 
    return option[typeof value](value) === type;
}