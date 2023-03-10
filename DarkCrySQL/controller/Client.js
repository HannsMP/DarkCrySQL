const superagent = require('superagent');
const color = require("../func/Colors");
class Client {
  #Arg;
  #err;
  /**
   * @param {{
   *    config:{
   *      logHistorial: boolean,
   *      asyncQuequ: boolean,
   *      encryp: boolean,
   *      view: boolean
   *      dirDatabase: string,
   *      dirlogger: string,
   *      hostDb: string, 
   *      space: number,
   *      utc: number,
   *    },
   *    login: {
   *      host: string,
   *      port: string | number,
   *      pass: string,
   *      url: string
   *    },
   *    tables:{
   *      nameTable: {
   *        nameColumms: "string" | "number" | "boolean" | "any" | "null"
   *      } | [...columms]
   *    } | [...string]
   *  }} Arg 
   * @returns 
   */
  constructor(Arg, user){
    this.#Arg = Arg;
    this.#Arg.login.user = user;
    
    superagent
      .post(`${Arg.login.url}/api/login`)
      .send(this.#Arg.login)
      .end((err, { body })=>{
        this.#err = body.err;
        if(!body.err || body.login) 
          console.log(
            color.brightGreen(
              `[DarkRest]: Client \u001b[34m "${Arg.login.url}" \u001b[38m..`
            )
          );
      });
    
    if(this.#err) return {};
  }
  /**
   * @param { {
   *   callback: (err: string, resp: [...{}])=>{}
   * } } Params 
   * @param { string } rute 
   */
  async #consultor(Params, rute){
    
    let {
      callback,
      ...Param
    } = Params;

    try{
      let res = await superagent
        .post(`${this.#Arg.login.url}/api/${rute}`)
        .send({
          login: this.#Arg.login,
          arg: Param
        })

      if(! res.body)
        throw (`NO HAY UNA RESPUESTA`)
      if(res.body.err)
        throw (`[SERVER] ${res.body.err}`); 

      if(callback)
        callback(null, res.body.resp);
      else
        return res.body.resp
    }catch(e){
      if(callback)
        callback(`[CLIENT] ${e}`);
      else
        throw (`\n[CLIENT] ${e}`);
    } 
  }
  /**
   * @param { string } tabla 
   */
  insert(table){
    let InputParams = new Map();
    InputParams.table = table;
    /**
     * @param {{
     *   table: string,
     *   data: [...{}],
     *   callback: (err: string, resp: [...{}])=>{} 
     * }} Params 
     */
    let send = async (Params)=>{
      return await this.#consultor(Params, 'insert');
    }
    //rutas
    return new (class Data {
      #InputParams;
      constructor(Send){
        this.#InputParams = Send;
      }
      /**
       * @param { ...Array<Object<string|number|boolean>> } data 
       */
      data(...data){
        this.#InputParams.data = data;

        return new (class End {
          #InputParams;
          constructor(Send){
            this.#InputParams = Send;
          }
          /**
           * @param { (err: string, resp: [...{}])=>{} } callback 
           */
          async end(callback){
            this.#InputParams.callback = callback;
            return await send(this.#InputParams);
          }
        })(this.#InputParams)
      }
      /**
       * @param  {...string} unique nombre de la columna que desea que sea unica
       * @returns 
       */
      unique(...unique){
        this.#InputParams.unique = unique;

        return new(class Data{
          #InputParams;
          constructor(Send){
            this.#InputParams = Send;
          }
          /**
           * @param { ...Array<Object<string|number|boolean>> } data 
           */
          data(...data){
            this.#InputParams.data = data;
    
            return new (class End {
              #InputParams;
              constructor(Send){
                this.#InputParams = Send;
              }
              /**
               * @param { (err: string, resp: [...{}])=>{} } callback 
               */
              async end(callback){
                this.#InputParams.callback = callback;
                return await send(this.#InputParams);
              }
            })(this.#InputParams)
          }
        })(this.#InputParams)
      }
    })(InputParams);
  }
  /**
   * @param { string } table 
   * @example
   * "nametables" este paremetro acepta el nombre de una tabla existente.
   * @param { string } selectRows util para seleccionar las filas que se desean usar, por defecto no se incluyen la de typeofData, las que estan en la papelera y las eliminadas definitivamente.
   * @example
   * "MIN": retorna la menor y una unica data existente
   * "MAX": retorna el mayor y una unica data existente
   * "***": retorna toda la data en la tabla incluida la typeofData
   * "**": retorna toda la data en la tabla incluida las que estan en la papelera y las eliminadas definitivamente
   * "*": retorna toda la data en la tabla incluida las que estan en la papelera
   */
  getyng(table, selectRows){
    let InputParams = new Map();
    InputParams.table = table;
    InputParams.selectRows = selectRows;
    /**
     * @param {{
     *   table: string,
     *   selectRows: string,
     *   select: [...string],
     *   id: [...number],
     *   where: [...string | ...number | ...boolean],
     *   join: [...{
     *     set: string,
     *     get: string,
     *     id: ()=>number,
     *     where: ()=>[...string]
     *     end: ()=>{},
     *   }], 
     *   callback: (err: string, resp: [...{}])=>{},
     * }} Params
     */
    let send = async (Params)=>{
      return await this.#consultor(Params, 'getyng');
    }

    //rutas
    return new (class Select {
      #InputParams;
      constructor(Send){
        this.#InputParams = Send;
      }
      /**
       * 
       * @param  {...Array<string>} * todo, ** todo sin restriccion, name, !name
       * @returns 
       */
      selectColumm(...select){
        this.#InputParams.select = select;
        return new (class Option {
            #InputParams;
            constructor(Send){
              this.#InputParams = Send;
            }
            /**
             * @example
             * .join(
             *   {
             *     ? Hace referencia a la propiedad a cambiar de la resp.
             *     set: 'menuId',
             *     ? Es la tabla de la que obtener el valor que se necesita.
             *     get: 'menus',
             *     ? id es un metodo mas rapido de busqueda por criterio, 
             *     ? no usar where despues o antes
             *     id: 12
             *     ? Where es un callback, donde res es la tabla SET, 
             *     ? necesario devolver un array con condiciones where.
             *     where: res => ['id', '==', res.menuId ],
             *     ? End es un callback, donde req es la tabla GET
             *     ? el valor devuelto sera reemplazado en la resp
             *     end: req => req.nombre
             *   }
             * )
             * @param { ...{
             *  set: string,
             *  get: string,
             *  id: number,
             *  where: (res: object)=>[ ...any],
             *  end: (req: object)=> any
             * } } join 
             * @example 
             * '===', '!==', igualdad exacta
             * '==', '!=', igualdad
             * '>=', '<=', 
             * '>', '<',
             * @example ! niega esta inclusion en la palabra
             * '~~', '!~~', inclusion exacta
             * '~', '!~', inclusion
             * '~=', '!~=', inclucion inicial 
             * '~~=', '!~~=', inclusion inicial exacta
             * '=~', '!=~', inclusion final
             * '=~~', '!=~~', inclusion final exacta
             * @example ! niega este conteo en la palabra
             * '_?' compara la cantidad de letras 
             * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
             * '._.', '._!', '!_.', '!_!', contador de extremos
             * '_._', '_!_', contador intermedio de 1 palabras
             * '._', '!_', contador inicial
             * '_.', '_!' contador final
             */
            join(...join){
              this.#InputParams.join = join;
              return new(class Where{
                #InputParams;
                constructor(Send){
                  this.#InputParams = Send;
                }
                /**
                 * @param { (err: string, resp: [...{}])=>{} } callback 
                 */
                end(callback){
                  this.#InputParams.callback = callback;
                  return send(this.#InputParams);
                }
              })(this.#InputParams)
            }
            /**
             * @param { ...Array<string> } where 
             * @example 
             * '===', '!==', igualdad exacta
             * '==', '!=', igualdad
             * '>=', '<=', 
             * '>', '<',
             * @example ! niega esta inclusion en la palabra
             * '~~', '!~~', inclusion exacta
             * '~', '!~', inclusion
             * '~=', '!~=', inclucion inicial 
             * '~~=', '!~~=', inclusion inicial exacta
             * '=~', '!=~', inclusion final
             * '=~~', '!=~~', inclusion final exacta
             * @example ! niega este conteo en la palabra
             * '_?' compara la cantidad de letras 
             * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
             * '._.', '._!', '!_.', '!_!', contador de extremos
             * '_._', '_!_', contador intermedio de 1 palabras
             * '._', '!_', contador inicial
             * '_.', '_!' contador final
             */
            where(...where){
              this.#InputParams.where = where;
              return new(class Join{
                #InputParams;
                constructor(Send){
                  this.#InputParams = Send;
                }
                /**
                 * @example
                 * .join(
                 *   {
                 *     ? Hace referencia a la propiedad a cambiar de la resp.
                 *     set: 'menuId',
                 *     ? Es la tabla de la que obtener el valor que se necesita.
                 *     get: 'menus',
                 *     ? id es un metodo mas rapido de busqueda por criterio, 
                 *     ? no usar where despues o antes
                 *     id: 12
                 *     ? Where es un callback, donde res es la tabla SET, 
                 *     ? necesario devolver un array con condiciones where.
                 *     where: res => ['id', '==', res.menuId ],
                 *     ? End es un callback, donde req es la tabla GET
                 *     ? el valor devuelto sera reemplazado en la resp
                 *     end: req => req.nombre
                 *   }
                 * )
                 * @param { ...{
                 *  set: string,
                 *  get: string,
                 *  id: number,
                 *  where: (res: object)=>[ ...any],
                 *  end: (req: object)=> any
                 * } } join 
                 * @example 
                 * '===', '!==', igualdad exacta
                 * '==', '!=', igualdad
                 * '>=', '<=', 
                 * '>', '<',
                 * @example ! niega esta inclusion en la palabra
                 * '~~', '!~~', inclusion exacta
                 * '~', '!~', inclusion
                 * '~=', '!~=', inclucion inicial 
                 * '~~=', '!~~=', inclusion inicial exacta
                 * '=~', '!=~', inclusion final
                 * '=~~', '!=~~', inclusion final exacta
                 * @example ! niega este conteo en la palabra
                 * '_?' compara la cantidad de letras 
                 * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
                 * '._.', '._!', '!_.', '!_!', contador de extremos
                 * '_._', '_!_', contador intermedio de 1 palabras
                 * '._', '!_', contador inicial
                 * '_.', '_!' contador final
                 */
                join(...join){
                  this.#InputParams.join = join;
                  return new (
                    class End{
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      end(callback){
                        this.#InputParams.callback = callback;
                        return send(this.#InputParams);
                      }
                    }
                  )(this.#InputParams)
                }
                /**
                 * @param { (err: string, resp: [...{}])=>{} } callback 
                 */
                end(callback){
                  this.#InputParams.callback = callback;
                  return send(this.#InputParams);
                }
              })(this.#InputParams)
            }
            /**
             * @param { [...number] } ids 
             */
            id(...ids){
              this.#InputParams.id = ids
              return new(class Join{
                #InputParams;
                constructor(Send){
                  this.#InputParams = Send;
                }
                /**
                 * @example
                 * .join(
                 *   {
                 *     ? Hace referencia a la propiedad a cambiar de la resp.
                 *     set: 'menuId',
                 *     ? Es la tabla de la que obtener el valor que se necesita.
                 *     get: 'menus',
                 *     ? id es un metodo mas rapido de busqueda por criterio, 
                 *     ? no usar where despues o antes
                 *     id: 12
                 *     ? Where es un callback, donde res es la tabla SET, 
                 *     ? necesario devolver un array con condiciones where.
                 *     where: res => ['id', '==', res.menuId ],
                 *     ? End es un callback, donde req es la tabla GET
                 *     ? el valor devuelto sera reemplazado en la resp
                 *     end: req => req.nombre
                 *   }
                 * )
                 * @param { ...{
                 *  set: string,
                 *  get: string,
                 *  id: number,
                 *  where: (res: object)=>[ ...any],
                 *  end: (req: object)=> any
                 * } } join 
                 * @example 
                 * '===', '!==', igualdad exacta
                 * '==', '!=', igualdad
                 * '>=', '<=', 
                 * '>', '<',
                 * @example ! niega esta inclusion en la palabra
                 * '~~', '!~~', inclusion exacta
                 * '~', '!~', inclusion
                 * '~=', '!~=', inclucion inicial 
                 * '~~=', '!~~=', inclusion inicial exacta
                 * '=~', '!=~', inclusion final
                 * '=~~', '!=~~', inclusion final exacta
                 * @example ! niega este conteo en la palabra
                 * '_?' compara la cantidad de letras 
                 * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
                 * '._.', '._!', '!_.', '!_!', contador de extremos
                 * '_._', '_!_', contador intermedio de 1 palabras
                 * '._', '!_', contador inicial
                 * '_.', '_!' contador final
                 */
                join(...join){
                  this.#InputParams.join = join;
                  return new (
                    class End{
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      end(callback){
                        this.#InputParams.callback = callback;
                        return send(this.#InputParams);
                      }
                    }
                  )(this.#InputParams)
                }
                /**
                 * @param { (err: string, resp: [...{}])=>{} } callback 
                 */
                end(callback){
                  this.#InputParams.callback = callback;
                  return send(this.#InputParams);
                }
              })(this.#InputParams)
            }
            /**
             * @param { (err: string, resp: [...{}])=>{} } callback 
             */
            end(callback){
              this.#InputParams.callback = callback;
              return send(this.#InputParams);
            }
          })(this.#InputParams)
      }
      /**
       * @param { (err: string, resp: [...{}])=>{} } callback 
       */
      end(callback){
        this.#InputParams.callback = callback;
        return send(this.#InputParams);
      }
    })(InputParams);
  }
  /**
   * @param { string } table 
   */
  update(table){
    let InputParams = new Map();
    InputParams.table = table;
    /**
     * @param {{
     *   login: {
     *     user: string,
     *     host: string,
     *     port: string | number,
     *     pass: string,
     *     url: string      
     *   },
     *   arg: {
     *     table: string,
     *     select: [...string],
     *     where: [...string],
     *     set: {},
     *     callback: (err: string, resp: [...{}])=>{}
     *   }
     * }} Send
     */
    let send = async (Send)=>{
      return await this.#consultor(Send, 'update');
    }
    //rutas
    return new(class Select{
      #InputParams;
      constructor(Send){
        this.#InputParams = Send;
      }
      /**
       * @param { ...string } select 
       * @examples 
       * ""vacio, segun metodo set(object) actualizara las propiedades, no elimina todo
       * "*" actualiza todo, eliminando todo lo anterior
       */
      select(...select){
        this.#InputParams.select = select;
        return new(class Where{
          #InputParams;
          constructor(Send){
            this.#InputParams = Send;
          }
          /**
           * @param { ...string } where 
           * @example 
           * '===', '!==', igualdad exacta
           * '==', '!=', igualdad
           * '>=', '<=', 
           * '>', '<',
           * @example ! niega esta palabra
           * '~~', '!~~', inclusion exacta
           * '~', '!~', inclusion
           * '~=', '!~=', inclucion inicial 
           * '~~=', '!~~=', inclusion inicial exacta
           * '=~', '!=~', inclusion final
           * '=~~', '!=~~', inclusion final exacta
           * @example ! niega esta palabra
           * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
           * '._.', '._!', '!_.', '!_!', contador de extremos
           * '_._', '_!_', contador intermedio de 1 palabras
           * '._', '!_', contador inicial
           * '_.', '_!' contador final
           */
          where(...where){
            this.#InputParams.where = where;
            return new (class Set{
              #InputParams;
              constructor(Send){
                this.#InputParams = Send;
              }
              /**
               * @param  { {} } set 
               */
              set(set){
                this.#InputParams.set = set;
                return new (class End {
                  #InputParams;
                  constructor(Send){
                    this.#InputParams = Send;
                  }
                  /**
                   * @param  {[...string]} clear 
                   */
                  clear(...clear){
                    this.#InputParams.clear = clear;
                    return new (class End {
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      async end(callback){
                        this.#InputParams.callback = callback;
                        return await send(this.#InputParams);
                      }
                    })(this.#InputParams)
                  }
                  /**
                   * @param { (err: string, resp: [...{}])=>{} } callback 
                   */
                  async end(callback){
                    this.#InputParams.callback = callback;
                    return await send(this.#InputParams);
                  }
                })(this.#InputParams)
              }
              /**
               * @param  {[...string]} clear 
               */
              clear(...clear){
                this.#InputParams.clear = clear;
                return new (class End {
                  #InputParams;
                  constructor(Send){
                    this.#InputParams = Send;
                  }
                  /**
                   * @param  { {} } set 
                   */
                  set(set){
                    this.#InputParams.set = set;
                    return new (class End {
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      async end(callback){
                        this.#InputParams.callback = callback;
                        return await send(this.#InputParams);
                      }
                    })(this.#InputParams)
                  }
                  /**
                   * @param { (err: string, resp: [...{}])=>{} } callback 
                   */
                  async end(callback){
                    this.#InputParams.callback = callback;
                    return await send(this.#InputParams);
                  }
                })(this.#InputParams)
              }
            })(this.#InputParams)
          }
          /**
           * @param { number } id 
           */
          id(id){
            this.#InputParams.id = id;
            return new (class Set{
              #InputParams;
              constructor(Send){
                this.#InputParams = Send;
              }
              /**
               * @param  { {} } set 
               */
              set(set){
                this.#InputParams.set = set;
                return new (class End {
                  #InputParams;
                  constructor(Send){
                    this.#InputParams = Send;
                  }
                  /**
                   * @param  {[...string]} clear 
                   */
                  clear(...clear){
                    this.#InputParams.clear = clear;
                    return new (class End {
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      async end(callback){
                        this.#InputParams.callback = callback;
                        return await send(this.#InputParams);
                      }
                    })(this.#InputParams)
                  }
                  /**
                   * @param { (err: string, resp: [...{}])=>{} } callback 
                   */
                  async end(callback){
                    this.#InputParams.callback = callback;
                    return await send(this.#InputParams);
                  }
                })(this.#InputParams)
              }
              /**
               * @param  {[...string]} clear 
               */
              clear(...clear){
                this.#InputParams.clear = clear;
                return new (class End {
                  #InputParams;
                  constructor(Send){
                    this.#InputParams = Send;
                  }
                  /**
                   * @param  { {} } set 
                   */
                  set(set){
                    this.#InputParams.set = set;
                    return new (class End {
                      #InputParams;
                      constructor(Send){
                        this.#InputParams = Send;
                      }
                      /**
                       * @param { (err: string, resp: [...{}])=>{} } callback 
                       */
                      async end(callback){
                        this.#InputParams.callback = callback;
                        return await send(this.#InputParams);
                      }
                    })(this.#InputParams)
                  }
                  /**
                   * @param { (err: string, resp: [...{}])=>{} } callback 
                   */
                  async end(callback){
                    this.#InputParams.callback = callback;
                    return await send(this.#InputParams);
                  }
                })(this.#InputParams)
              }
            })(this.#InputParams)
          }
        })(this.#InputParams)
      }
    })(InputParams);
  }
  /**
   * @param { string } table nombre de la tabla 
   * @param { boolean } definitive este parametro es opcional significa 
   * si se establece en "true" la eliminacion definitiva de esos datos en la db
   */
  delete(table, definitive){
    let InputParams = new Map();
    InputParams.table = table;
    InputParams.definitive = definitive;
    /**
    * @param {{
    *   login: {
    *     user: string,
    *     host: string,
    *     port: string | number,
    *     pass: string,
    *     url: string      
    *   },
    *   arg: {
    *     table: string,
    *     where: [...string],
    *     callback: (err: string, resp: [...{}])=>{}
    *   }
    * }} Send
    */
   let send = async (Send)=>{
    return await this.#consultor(Send, 'delete');
   }

    //rutas
    return new(class Select{
      #InputParams;
      constructor(Send){
        this.#InputParams = Send;
      }
      /**
       * @param { ...Array<string> } where 
       * @example 
       * '===', '!==', igualdad exacta
       * '==', '!=', igualdad
       * '>=', '<=', 
       * '>', '<',
       * @example ! niega esta palabra
       * '~~', '!~~', inclusion exacta
       * '~', '!~', inclusion
       * '~=', '!~=', inclucion inicial 
       * '~~=', '!~~=', inclusion inicial exacta
       * '=~', '!=~', inclusion final
       * '=~~', '!=~~', inclusion final exacta
       * @example ! niega esta palabra
       * '_._._', '_._!_', '_!_._', '_!_!_', contador intermedio de 2 palabras
       * '._.', '._!', '!_.', '!_!', contador de extremos
       * '_._', '_!_', contador intermedio de 1 palabras
       * '._', '!_', contador inicial
       * '_.', '_!' contador final
       */
      where(...where){
        this.#InputParams.where = where;
        return new (class Where{
          #InputParams;
          constructor(Send){
            this.#InputParams = Send;
          }
          /**
           * @param { (nameTable: Array<Object<string|number|boolean>>)=>{} } callback 
           */
          async end(callback){
            this.#InputParams.callback = callback;
            return await send(this.#InputParams);
          }
        })(this.#InputParams)
      }
      /**
       * @param { number } id 
       */
      id(id){
        this.#InputParams.id = id;
        return new (class Where{
          #InputParams;
          constructor(Send){
            this.#InputParams = Send;
          }
          /**
           * @param { (nameTable: Array<Object<string|number|boolean>>)=>{} } callback 
           */
          async end(callback){
            this.#InputParams.callback = callback;
            return await send(this.#InputParams);
          }
        })(this.#InputParams)
      }
    })(InputParams);
  }
  /**
   * @param { string } table 
   * @example
   * "*" todas las tablas
   * "nameTable" nombre de la tabla en especifico
   */
  length(...table){
    let InputParams = new Map();
    InputParams.table = table;
    /**
     * @param {{
     *   table: [...string],
     *   select: string,
     *   callback: (err: string, resp: {})=>{}
     * }} Send
     */
    let send = async (Send)=>{
      return await this.#consultor(Send, 'length');
    }

    return new (class Select{
      #InputParams;
      constructor(Send){
        this.#InputParams = Send
      }
      /**
       * @param { string } select 
       * @example
       * "***" absolutamente todo
       * "**" todo 
       * "*" todo lo visible
       */
      select(select){
        this.#InputParams.select = select;
        
        return new(class End{
          #InputParams;
          constructor(Send){
            this.#InputParams = Send
          }
          /**
           * @param { (err: string, resp: {})=>{} } callback 
           * @returns 
           */
          async end(callback){
            this.#InputParams.callback = callback;
            return await send(this.#InputParams);
          }
        })(this.#InputParams)
      }
    })(InputParams);
  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  rebootTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param {{
     *   login: {
     *     user: string,
     *     host: string,
     *     port: string | number,
     *     pass: string,
     *     url: string      
     *   },
     *   arg: {
     *     nameTable: string,
     *     callback: (err: string, resp: boolean)=>{}
     *   }
     * }} Send
     */
    let send = async (Send)=>{
      return await this.#consultor(Send, 'rebootTable');
    }

    return new(class End {
      #InputParams
      constructor(Send){
        this.#InputParams = Send
      }
      async end(callback){
        this.#InputParams.callback = callback;
          return await send(this.#InputParams);
      }
    })(InputParams);
  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  createTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param {{
     *   login: {
     *     user: string,
     *     host: string,
     *     port: string | number,
     *     pass: string,
     *     url: string      
     *   },
     *   arg: {
     *     nameTable: string,
     *     callback: (err: string, resp: [...{}])=>{}
     *   }
     * }} Send
     */
    let send = async (Send)=>{
      return await this.#consultor(Send, 'createTable');
    }

    return new(class End {
      #InputParams
      constructor(Send){
        this.#InputParams = Send
      }
      async end(callback){
        this.#InputParams.callback = callback;
        return await send(this.#InputParams);
      }
    })(InputParams);
  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  deleteTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param {{
     *   login: {
     *     user: string,
     *     host: string,
     *     port: string | number,
     *     pass: string,
     *     url: string      
     *   },
     *   arg: {
     *     nameTable: string,
     *     callback: (err: string, resp: [...{}])=>{}
     *   }
     * }} Send
     */
    let send = async (Send)=>{
      return await this.#consultor(Send, 'deleteTable');
    }

    return new(class End {
      #InputParams
      constructor(Send){
        this.#InputParams = Send
      }
      async end(callback){
        this.#InputParams.callback = callback;
          return await send(this.#InputParams);
      }
    })(InputParams);
  }
}

module.exports = Client;