let {
  //lee directorio
  readdirSync, 
  //existe directorio
  existsSync, 
  // elimina una carpeta u archivo
  mkdirSync,
  // ecribe en un archivo y lo crea si no existe
  writeFileSync,
  // lee un archivo
  readFileSync
} = require('fs');

const { 
  sep,
  join,
  resolve
} = require('path');

let Encrypter = require('cryptr');

class File{
  #option;
  #status;
  /**
   * @param {{
   *  create: boolean,
   *  isEncryptable: boolean,
   *  dirFile: string,
   *  secret: string,
   *  space: number,
   * }} option 
   */
  constructor(option){
    this.#option = option;
  }
  /**
   * retorna el lo que el callback retorne
   * @param { (err: string)=>{} } callback
   * @returns { {} | [] | string }
   */
  read(callback){
    try{
      let data = JSON.parse(
        readFileSync(this.#option.dirFile, "utf-8")
      );

      if(typeof data === 'object')
        return data;
      if(typeof data === 'string')
        return JSON.parse(
          new Encrypter(this.#option.secret)
            .decrypt(data)
        )
      return callback()
    }catch(e){
      if(callback)
        return callback(e);
    }
  }
  /**
   * retorna el lo que el callback retorne
   * @param { (err: string)=>{} } callback
  
   * @returns { {} | [] | string }
   */
  require(callback){
    try{
      /**
       * @type { JSON }
       */
      let parse = require(this.#option.dirFile)
      if(typeof parse === 'object')
        return parse;
      if(typeof parse === 'string')
        return JSON.parse(
          new Encrypter(this.#option.secret)
            .decrypt(parse)
        )
      return callback()
      
    }catch(e){
      if(callback) 
        return callback(e)
      return {};
    }
  }
  /**
   * @param { [...{}] } data 
   * @param { (err: string)=>{} } callback 
   * @returns { boolean }
   */
  write(data, callback){
    if(! this.#option.create)
      return false;
    try{
      if(typeof data === 'object')
        data = JSON.stringify(data, null, this.#option.space || 0);
      if(this.#option.isEncryptable)
        data = `"${new Encrypter(this.#option.secret)
          .encrypt(data)}"`;

      writeFileSync(this.#option.dirFile, data);
      return true;
    }catch(e){
      if(callback) callback(e);
      return false;
    }
  }
}

module.exports.File = File;

class WriteReadFile{
  #option;
  /**
   * @param { string } strDir 
   * @returns { Array.<string> } 
   */
  #splitDir(strDir){
    return strDir.split(sep)
  }
  /**
   * @param {{
   *  create: boolean,
   *  isEncryptable: boolean,
   *  dirFolder: string,
   *  secret: string,
   *  space: number,
   * }} option 
   */
  constructor({create, isEncryptable, dirFolder, secret, space}){
    this.#option = {
      create: create,
      isEncryptable: isEncryptable,
      dirFolder: resolve(dirFolder),
      secret: secret,
      space: space
    };

    if(create && !existsSync(this.#option.dirFolder)) {
      let lengthDirHome = this.#splitDir(process.cwd()).length;
      let addDir = "";

      this.#splitDir(this.#option.dirFolder).forEach((dir, index)=>{
        if(index < lengthDirHome) 
          return;
        addDir = resolve(addDir, dir)
        if(existsSync(addDir)) 
          return;
        mkdirSync(addDir);
      });
    };
  }

  /**
   * @param  { ...string } path 
   */
  file(create, ...path){

    let addFolder = [...path];
    let file = addFolder.pop();
    if(create)
      this.add(...addFolder);
    
    let dirFile = join(this.#option.dirFolder, ...path);

    return new File({
      create: this.#option.create,
      isEncryptable: this.#option.isEncryptable,
      dirFile: dirFile,
      secret: this.#option.secret,
      space: this.#option.space
    });
  }

  /**
   * @param  { ...string } path 
   * @returns { boolean }
   */
  add(...path){
    if(! this.#option.create)
      return false;
    try{
      if(typeof path[0] === 'object'){
        let loopDir = (dirInit, addPaht)=>{
          if(typeof addPaht === 'object'){
            if(Array.isArray(addPaht)){
              addPaht.forEach((file)=>{
                let fileDir = join(dirInit, file);
                if(existsSync(fileDir))
                  return;
                if(file.includes('.') && !file.endsWith('/'))
                  writeFileSync(fileDir, "")
                else
                  mkdirSync(fileDir);
              })
            }
            else{
              Object.keys(addPaht).forEach((file)=>{
                let fileDir = join(dirInit, file);
                if(!existsSync(fileDir))
                  mkdirSync(fileDir);
                loopDir(fileDir, addPaht[file])
              })
            }
          }
          if(typeof addPaht === 'string'){
            let fileDir = join(dirInit, addPaht);
            if(existsSync(fileDir))
              return;
            if(addPaht.includes('.') && !addPaht.endsWith('/'))
              writeFileSync(fileDir, "")
            else
              mkdirSync(fileDir);
          }
        }
        loopDir(this.#option.dirFolder, path[0])
      }
      else if(typeof path[0] === 'string'){
        let addPath = join(...path);
        let addDir = this.#option.dirFolder;

        this.#splitDir(addPath).forEach((dir)=>{
          addDir = join(addDir, dir)
          if(existsSync(addDir)) 
            return;
          mkdirSync(addDir);
        })
      }

      return true
    }catch(e){
      return false
    }
  }

  /**
   * @param  { ...string } path 
   * @returns 
   */
  peekFolder(...path){
    let peekDir = (obj, dirInit)=>{
      readdirSync(dirInit).forEach((file)=>{
        let read = {};
        try{
          read = peekDir(read, join(dirInit, file))
          obj[`${file}/`] = read
        }catch{
          obj[file] = "[DATA]"//readFileSync(join(dirInit, file), 'utf-8');
        }
      })

      return obj
    }
    let res = peekDir({}, join(this.#option.dirFolder, ...path))
    return res
  }
}

module.exports.WriteReadFile = WriteReadFile;