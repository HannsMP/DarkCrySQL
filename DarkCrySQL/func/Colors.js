const colors = require('colors');
class Colors {
  /**
   * @param { Object.<string, [
   *   setName: [
   *      "bgBrightRed"
   *     |"bgBrightGreen"
   *     |"bgBrightYellow"
   *     |"bgBrightBlue"
   *     |"bgBrightMagenta"
   *     |"bgBrightCyan"
   *     |"bgBrightWhite"
   *     |"brightRed"
   *     |"brightGreen"
   *     |"brightYellow"
   *     |"brightBlue"
   *     |"brightMagenta"
   *     |"brightCyan"
   *     |"brightWhite"
   *     |"bgBlack"
   *     |"bgRed"
   *     |"bgGreen"
   *     |"bgYellow"
   *     |"bgBlue"
   *     |"bgMagenta"
   *     |"bgCyan"
   *     |"bgWhite"
   *     |"bgGray"
   *     |"bgGrey"
   *     |"black"
   *     |"red"
   *     |"green"
   *     |"yellow"
   *     |"blue"
   *     |"magenta"
   *     |"cyan"
   *     |"white"
   *     |"gray"
   *     |"grey
   *       ,
   *      "reset"
   *     |"bold"
   *     |"dim"
   *     |"underline"
   *     |"inverse"
   *     |"hidden"
   *     |"strikethrough"
   *     |"rainbow"
   *     |"zebra"
   *     |"america"
   *     |"trap"
   *     |"random"
   *   ]
   * ]> | undefined } setTheme 
   * @example
   * set:
   * { lion: ["orange", "underline"] }
   * get:
   * console.log("hello world".lion)
   */
  constructor(setTheme){
    if(typeof setTheme === 'object')
      return colors.setTheme(setTheme);
  }
  /**
   * bright background colors 🔴
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightRed(...msg){
    return colors.bgBrightRed(...msg)
  }
  /**
   * bright background colors 🟢
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightGreen(...msg){
    return colors.bgBrightGreen(...msg)
  }
  /**
   * bright background colors 🟡
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightYellow(...msg){
    return colors.bgBrightYellow(...msg)
  }
  /**
   * bright background colors 🔵
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightBlue(...msg){
    return colors.bgBrightBlue(...msg)
  }
  /**
   * bright background colors 🟣
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightMagenta(...msg){
    return colors.bgBrightMagenta(...msg)
  }
  /**
   * bright background colors 🧼
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightCyan(...msg){
    return colors.bgBrightCyan(...msg)
  }
  /**
   * bright background colors ⚪
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBrightWhite(...msg){
    return colors.bgBrightWhite(...msg)
  }
  /**
   * bright text colors 🔴
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightRed(...msg){
    return colors.brightRed(...msg)
  }
  /**
   * bright text colors 🟢
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightGreen(...msg){
    return colors.brightGreen(...msg)
  }
  /**
   * bright text colors 🟡
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightYellow(...msg){
    return colors.brightYellow(...msg)
  }
  /**
   * bright text colors 🔵
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightBlue(...msg){
    return colors.brightBlue(...msg)
  }
  /**
   * bright text colors 🟣
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightMagenta(...msg){
    return colors.brightMagenta(...msg)
  }
  /**
   * bright text colors 🧼
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightCyan(...msg){
    return colors.brightCyan(...msg)
  }
  /**
   * bright text colors ⚪
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static brightWhite(...msg){
    return colors.brightWhite(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBlack(...msg){
    return colors.bgBlack(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgRed(...msg){
    return colors.bgRed(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgGreen(...msg){
    return colors.bgGreen(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgYellow(...msg){
    return colors.bgYellow(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgBlue(...msg){
    return colors.bgBlue(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgMagenta(...msg){
    return colors.bgMagenta(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgCyan(...msg){
    return colors.bgCyan(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgWhite(...msg){
    return colors.bgWhite(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgGray(...msg){
    return colors.bgGray(...msg)
  }
  /**
   * background colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bgGrey(...msg){
    return colors.bgGrey(...msg)
  }
  /**
   * text colors ⚫
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static black(...msg){
    return colors.black(...msg)
  }
  /**
   * text colors 🔴
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static red(...msg){
    return colors.red(...msg)
  }
  /**
   * text colors 🟢
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static green(...msg){
    return colors.green(...msg)
  }
  /**
   * text colors 🟡
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static yellow(...msg){
    return colors.yellow(...msg)
  }
  /**
   * text colors 🔵
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static blue(...msg){
    return colors.blue(...msg)
  }
  /**
   * text colors 🟣
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static magenta(...msg){
    return colors.magenta(...msg)
  }
  /**
   * text colors 🧼
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static cyan(...msg){
    return colors.cyan(...msg)
  }
  /**
   * text colors ⚪
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static white(...msg){
    return colors.white(...msg)
  }
  /**
   * text colors 🔘
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static gray(...msg){
    return colors.gray(...msg)
  }
  /**
   * text colors 🔘
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static grey(...msg){
    return colors.grey(...msg)
  }
  /**
   * reset text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static reset(...msg){
    return colors.reset(...msg)
  }
  /**
   * bold text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static bold(...msg){
    return colors.bold(...msg)
  }
  /**
   * dim text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static dim(...msg){
    return colors.dim(...msg)
  }
  /**
   * underline text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static underline(...msg){
    return colors.underline(...msg)
  }
  /**
   * inverse text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static inverse(...msg){
    return colors.inverse(...msg)
  }
  /**
   * hidden text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static hidden(...msg){
    return colors.hidden(...msg)
  }
  /**
   * strikethrough text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static strikethrough(...msg){
    return colors.strikethrough(...msg)
  }
  /**
   * rainbow text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static rainbow(...msg){
    return colors.rainbow(...msg)
  }
  /**
   * zebra text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static zebra(...msg){
    return colors.zebra(...msg)
  }
  /**
   * america text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static america(...msg){
    return colors.america(...msg)
  }
  /**
   * trap text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static trap(...msg){
    return colors.trap(...msg)
  }
  /**
   * random text colors
   * @param  {[...string]} msg 
   * @returns {string}
   */
  static random(...msg){
    return colors.random(...msg)
  }
}

module.exports = Colors