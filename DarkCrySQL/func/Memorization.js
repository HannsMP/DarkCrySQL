const jShashes = require('jshashes');

class Memorization {
  #save = {};
  #hash = (new jShashes.SHA1()).hex
  /**
   * @param {} Key
   * @param { number | string | [] | {} | ()=>save } Value 
   * @returns 
   */
  cache(Key, Value){
    
    let keyHash = this.#hash(Key);
    
    if(this.#save.hasOwnProperty(keyHash) && !Value)
      return this.#save[keyHash];

    if(Value)
      this.#save[keyHash] 
        = Value 
          = typeof Value === 'function'
            ? Value()
            : Value;
      
    return Value;
  }
}

module.exports = Memorization;