Object.isObject = function(data){
  return typeof data === 'object' && !Array.isArray(data) && data
};

Object.prototype.__property = Object.prototype.hasOwnProperty;

Object.prototype.__findProperty = function(key){
  return Object.keys(this).some(x=>x == key);
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 */
Object.prototype.__forEach = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  for(let i = 0; i < size; i++){
    let key = keys[i];
    callback(this[key], key, this, i, keys);
  }
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { {} }
 */
Object.prototype.__map = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = {};
  for(let i = 0; i < size; i++){
    let key = keys[i];
    res[key] = callback(this[key], key, this, i, keys);
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>Promise } callback
 * @returns { Promise<{}> }
 */
Object.prototype.__mapPromise = async function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = {};
  for(let i = 0; i < size; i++){
    let key = keys[i];
    res[key] = await callback(this[key], key, this, i, keys);
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { {} }
 */
Object.prototype.__filter = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = {};
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(callback(this[key], key, this, i, keys))
      res[key] = this[key];
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { Promise<{}> }
 */
Object.prototype.__filterPromise = async function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = {};
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(await callback(this[key], key, this, i, keys))
      res[key] = this[key];
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { string | undefined }
 */
Object.prototype.__find = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;
  
  let res;
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(callback(this[key], key, this, i, keys)){
      res = this[key];
      break;
    }
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { string | undefined }
 */
Object.prototype.__findKey = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;
  
  let res;
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(callback(this[key], key, this, i, keys)){
      res = key;
      break;
    }
  }
  return res;
};

/**
 * @param {(element: string|[], key: string, obj: this, index: number, keys: [...string])=>} callback
 * @returns { boolean }
 */
Object.prototype.__every = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;
  
  let res = true;
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(! callback(this[key], key, this, i, keys)){
      res = false;
      break;
    }
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { boolean }
 */
Object.prototype.__some = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;
  
  let res = false;
  for(let i = 0; i < size; i++){
    let key = keys[i];
    if(callback(this[key], key, this, i, keys)){
      res = true;
      break;
    }
  }
  return res;
};

/**
 * @param { (element: string, key: number, obj: {}, index: number, keys: string[])=>* } callback
 * @returns { {} }
 */
Object.prototype.__flatMap = function(callback){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = {};
  for(let i = 0; i < size; i++){
    let key = keys[i];
    let rest = callback(this[key], key, this, i, keys);
    if(! Array.isArray(rest) && typeof rest === 'object')
      res = {
        ...res,
        ...rest
      };
    else
      res[key] = this[key];
  }
  return res;
};

/**
 * @param { number } flat
 * @returns { {} }
 */
Object.prototype.__flat = function(flat = 0){
  
  let obj = this
  let res
  for(let f = 0; f < flat; f++){

    let keys = Object.keys(obj);
    let size = keys.length;
    res = {};
    for(let i = 0; i < size; i++){
      let key = keys[i];
      let rest = obj[key];
      if(! Array.isArray(rest) && typeof rest === 'object')
        res = {
          ...res,
          ...rest
        };
      else
        res[key] = obj[key];
    }
    obj = res
  }
  return res;
};

/**
 * @param { string } separator
 * @returns { string } 
 */
Object.prototype.__join = function(separator = ","){
  let keys = Object.keys(this);
  let size = keys.length;

  let res = ""

  for(let i = 0; i < size; i++){
    let key = keys[i];
    res += (this[key] + separator);
  }
  return res;
};

/**
 * @param {(a, b)=>number} callback 
 */
Object.prototype.__sort = function (callback){
  let keys = Object.keys(this);
  let keysSort = keys.sort(callback);
  let res = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    res[key] = this[key];
  }
  return res;
};

Object.prototype.__compareStr = function (data){
  return JSON.stringify(this) === JSON.stringify(data)
};

Object.prototype.__compareLength = function (data){
  return Object.keys(this).length === Object.keys(data).length
};

Object.prototype.__compare = function (data){
  
  let compare = (dt, cp)=>{
    
    if(JSON.stringify(dt) === JSON.stringify(cp))
      return true;
    
    if(Object.isObject(dt)){
      if(! dt.__compareLength(cp))
        return false;

      return dt.__every((value, key)=>{
        if(typeof value === 'object')
          return compare(value, cp[key]);
        if(typeof value === 'function')
          return String(value) == String(cp[key]);
        return value === cp[key];
      });
    }

    if(Array.isArray(dt) && Array.isArray(cp)){
      if(dt.length !== cp.length)
        return false;

      return dt.every((value, index)=>{
        if(typeof value === 'object')
          return compare(value, cp[index]);
        if(typeof value === 'function')
          return String(value) == String(cp[index]);
        return value === cp[index];
      });
    }

    return false;
  };

  return compare(this, data);
};

/* (()=>{
  [].forEach; //si
  [].map; //si
  [].filter; //si
  [].find;//si
  [].findIndex;//si findKey
  [].every;//si
  [].some;//si
  [].flatMap;//

  [].flat;
  [].join;
  [].toString;
  
  [].fill;
  [].at; 
  [].push;
  [].pop;
  [].concat;
  [].copyWithin;
  [].entries;
  [].includes;
  [].indexOf;
  [].lastIndexOf;
  [].reduce;
  [].reduceRight;
  [].reverse;
  [].shift;
  [].slice;
  [].splice;
  [].sort;
  [].toLocaleString;
  [].unshift;
  [].values;
}) */