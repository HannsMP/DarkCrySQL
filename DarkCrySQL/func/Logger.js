const Colors = require("./Colors");
const dateTime = require('date-and-time');
const config = require('../config');

const { WriteReadFile, File } = require('./BrowsePath');

//made by me, if you like it, don't steal the credits https://github.com/HannsMP

//hecho por mi, si te gusta no robes los creditos https://github.com/HannsMP

class Logger {
  #file;
  #config;
  /**
   * @param {{
   *  config: config, 
   *  file: File
   * }} option 
   */
  constructor({config, file}){
    this.#config = config;
    this.#file = file;
  }
  #date(GMT){
    return dateTime.addHours(new Date(), GMT || this.#config.LOGGER.GMT)
  }
  #time(GTM){
    let time = this.#date(GTM);

    let hora = time.getHours();
    let minuto = time.getMinutes();
    let segundo = time.getSeconds();
    let dia = time.getDate();
    let mes = time.getMonth();
    let año = time.getFullYear() ;

    return `[${
      dia >= 10
      ? dia
      : `0${dia}`
    }/${
      mes >= 10
      ? mes
      : `0${mes}`
    }/${
      año
    } ${
      hora >= 10
      ? hora
      : `0${hora}`
    }:${
      minuto >= 10
      ? minuto
      : `0${minuto}`
    }:${
      segundo >= 10
      ? segundo
      : `0${segundo}`
    } ${
      hora >= 12
      ? 'pm'
      : 'am'
    }]`
  }
  /**
   * @param {string} text 
   * @param { "bgBrightRed"
   *    |"bgBrightGreen"
   *    |"bgBrightYellow"
   *    |"bgBrightBlue"
   *    |"bgBrightMagenta"
   *    |"bgBrightCyan"
   *    |"bgBrightWhite"
   *    |"brightRed"
   *    |"brightGreen"
   *    |"brightYellow"
   *    |"brightBlue"
   *    |"brightMagenta"
   *    |"brightCyan"
   *    |"brightWhite"  
   *    |"bgBlack"
   *    |"bgRed"
   *    |"bgGreen"
   *    |"bgYellow"
   *    |"bgBlue"
   *    |"bgMagenta"
   *    |"bgCyan"
   *    |"bgWhite"
   *    |"bgGray"
   *    |"bgGrey"
   *    |"black"
   *    |"red"
   *    |"green"
   *    |"yellow"
   *    |"blue"
   *    |"magenta"
   *    |"cyan"
   *    |"white"
   *    |"gray"
   *    |"grey"
   *    |"reset"
   *    |"bold"
   *    |"dim"
   *    |"italic"
   *    |"underline"
   *    |"inverse"
   *    |"hidden"
   *    |"strikethrough"
   *    |"rainbow"
   *    |"zebra"
   *    |"america"
   *    |"trap"
   *    |"random"
   * } color 
   * @param {(Text)=>string} callback 
   */
  paint(text, color, callback) {
    try{
      let time = this.#time(this.#config.LOGGER.GMT);
      let dataFile = this.#file.read((e)=>{
        return "";
      })
      if(this.#config.LOGGER.STATUS) {
        //obteniendo datos
        //escribiendo en el objeto
        let Text 
          = time
          + JSON.stringify(text, null, 2)
          + `\n`
          + dataFile;
        //escribiendo en el archivo
        this.#file.write(Text)
      }

      //si existe color, se escribe ne la consola
      if(color) {
        console.log(
          Colors.brightMagenta(`${time}`) 
          + Colors.brightWhite(" | ")
          + Colors[color]( 
            typeof callback === 'function'
              ? callback(text) 
              : text 
          )
        );    
      }
    }catch(err){
      return console.log(err);
    }
  }

  log(...msg){
    try{
      let time = this.#time(this.#config.LOGGER.GMT);
      let dataFile = this.#file.read((e)=>{
        return "";
      })
      if(this.#config.LOGGER.STATUS) {
        //obteniendo datos
        //escribiendo en el objeto
        let Text 
          = time
          + msg.join(' ')
          + `\n`
          + dataFile;
        //escribiendo en el archivo
        this.#file.write(Text)
      }

      console.log(
        Colors.brightMagenta(`${time}`),
        Colors.brightWhite(" | "),
        Colors.brightGreen(...msg).bold
      );    
    }catch(err){
      this.err(err);
    }
  }
  err(...msg){
    try{
      let time = this.#time(this.#config.LOGGER.GMT);
      let dataFile = this.#file.read((e)=>{
        return "";
      })
      if(this.#config.LOGGER.STATUS) {
        //obteniendo datos
        //escribiendo en el objeto
        let Text 
          = time
          + msg.join(' ')
          + `\n`
          + dataFile;
        //escribiendo en el archivo
        this.#file.write(Text)
      }

      console.log(
        Colors.brightMagenta(`${time}`),
        Colors.brightWhite(" | "),
        Colors.brightRed(...msg).bold
      );    
    }catch(err){
      this.err(err);
    }
  }
  warn(...msg){
    try{
      let time = this.#time(this.#config.LOGGER.GMT);
      let dataFile = this.#file.read((e)=>{
        return "";
      })
      if(this.#config.LOGGER.STATUS) {
        //obteniendo datos
        //escribiendo en el objeto
        let Text 
          = time
          + msg.join(' ')
          + `\n`
          + dataFile;
        //escribiendo en el archivo
        this.#file.write(Text)
      }

      console.log(
        Colors.brightMagenta(`${time}`),
        Colors.brightWhite("|"),
        Colors.brightYellow(...msg).bold
      );    
    }catch(err){
      this.err(err);
    }
  }
}

module.exports.Logger = Logger;

class DirLogger {
  #config
  /**
   * @param { config } config 
   */
  constructor(config) {
    this.#config = config;
  }
  
  /**
   * @param  { ...string } path 
   * @returns 
   */
  file(...path){
    let dirLogger = new WriteReadFile({
      create: this.#config.LOGGER.STATUS,
      isEncryptable: this.#config.QUERY.ENCRYP,
      dirFolder: this.#config.LOGGER.DIRLOGGER,
      secret: this.#config.QUERY.SECRET,
      space: this.#config.QUERY.SPACE
    });
    
    return new Logger({
      file: dirLogger.file(...path),
      config: this.#config
    });
  }
}

module.exports.DirLogger = DirLogger;