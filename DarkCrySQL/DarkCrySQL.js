const { resolve } = require('path');
const prompt = require("basic-prompt");

const Query = require('./controller/Query');
const Client = require('./controller/Client');
const ApiRest = require('./controller/ApiRest');

const { WriteReadFile } = require('./func/BrowsePath');
const { DirLogger } = require('./func/Logger');
const Colors = require('./func/Colors');

require('./global/poliFill');

class DarkRest {
  #config = require('./config.js');
  #rules = {
    /**
     * @type { type: Object.<string, boolean> }
     */
    type : {
      "string": true,
      "number": true,
      "boolean": true,
      "list": true,
      "reverseList": true
    },
    /**
     * @type { Object.<string, (
     *   constraint: {
     *     type: {},
     *     NN: {},
     *     PK: {},
     *     AI: {},
     *     UQ: {},
     *     DF: {},
     *     FK: {},
     *     CH: {},
     *     CI: {}
     *   },
     *   nameColumm: string
     * )=>{}> }
     */
    constraint : {
      //NOT NULL- Asegura que una columna no puede tener un valor NULL
      "NN": (constraint, nameColumm)=>{
        constraint["NN"][nameColumm] = true;
        return constraint;
      },
      
      //PRIMARY KEY- Una combinación de a NOT NULLy UNIQUE. Identifica de forma única cada fila en una tabla
      "PK": (constraint, nameColumm)=>{
        constraint = this.#rules.constraint["NN"](constraint, nameColumm);
        constraint = this.#rules.constraint["UQ"](constraint, nameColumm);
        constraint["PK"][nameColumm] = true;
        return constraint;
      },
      
      //El incremento automático permite generar automáticamente un número único cuando se inserta un nuevo registro en una tabla.
      "AI": (constraint, nameColumm)=>{
        if(! constraint["AI"].__property(nameColumm))
          constraint["AI"][nameColumm] = 0;
        return constraint;
      },
  
      //UNIQUE- Asegura que todos los valores en una columna sean diferentes
      "UQ": (constraint, nameColumm)=>{
        if(! (constraint["type"][nameColumm] === 'string' || constraint["type"][nameColumm] === 'number'))
          throw this.#Logger.err("[Proceso DarkRest] [rules]: UNIQUE SOLO PUEDE SER DEL TIPO DE VALOR <string> Ó <number>");
        if(! constraint["UQ"].__property(nameColumm))
          constraint["UQ"][nameColumm] = {};
        return constraint;
      },

      //CREATE INDEX- Se utiliza para crear y recuperar datos de la base de datos muy rápidamente
      "CI": (constraint, nameColumm)=>{
        if(! (constraint["type"][nameColumm] === 'string' || constraint["type"][nameColumm] === 'number'))
          throw this.#Logger.err("[Proceso DarkRest] [rules]: CREATE INDEX SOLO PUEDE SER DEL TIPO DE VALOR <string> Ó <number>");
        if(! constraint["CI"].__property(nameColumm))
          constraint["CI"][nameColumm] = {}
        return constraint
      }
    },
    /**
     * @type { Object.<string, (
     *   constraint: {
     *     type: {},
     *     NN: {},
     *     PK: {},
     *     AI: {},
     *     UQ: {},
     *     DF: {},
     *     FK: {},
     *     CH: {},
     *     CI: {}
     *   },
     *   nameColumm: string,
     *   value: string,
     *   updatedTable: {}
     * )=>{}> }
     */
    static : {
      //DEFAULT- Establece un valor predeterminado para una columna si no se especifica ningún valor
      "DF": (constraint, nameColumm, value, updatedTable)=>{
        if(typeof value !== constraint["type"][nameColumm])
          throw this.#Logger.err(`[Proceso DarkRest] [rules]: EL VALOR POR DEFECTO TIENE QUE SER DEL TIPO DE DATO DE LA COLUMNA`);  
        constraint["DF"][nameColumm] = value;
        return constraint
      },
  
      //FOREIGN KEY - Previene acciones que destruirían enlaces entre tablas
      "FK": (constraint, nameColumm, value, updatedTable)=>{
        value = value.split('.')
        if(! updatedTable.__property(value[0]))
          throw this.#Logger.err(`[Proceso DarkRest] [rules]: LA FOREIGN KEY NO PUEDE ENLAZARCE A UNA TABLA QUE NO EXISTE "${value[0]}"`);
        
        if(! updatedTable[value[0]].__property(value[1]))
          throw this.#Logger.err(`[Proceso DarkRest] [rules]: NO EXISTE LA COLUMNA "${value[1]}" EN LA TABLA "${value[0]}"`);
          
        if(! updatedTable[value[0]][value[1]][1].some(x=>x=='PK'))
          throw this.#Logger.err(`[Proceso DarkRest] [rules]: LA COLUMNA "${value[1]}" NO ES UNA PK EN LA TABLA "${value[0]}"`);
        
        constraint["FK"][nameColumm] = value;
        return constraint
      },
  
      //CHECK- Asegura que los valores en una columna satisfagan una condición específica
      "CH": (constraint, nameColumm, value, updatedTable)=>{
        if(typeof value !== 'function')
          throw this.#Logger.err(`[Proceso DarkRest] [rules]: CHECK SOLO PUEDE SER UNA FUNCION`);
        constraint["CH"][nameColumm] = String(value);
        return constraint
      }
    }
  };
  #tables;
  #dirDatabase;
  #Logger;
  /**
   * @param { Object.< string, Object.< string, [
   *  "string" | "number" | "boolean",
   *  Array.<"AI" | "UQ" | "NN" | "PK" | "CI" | undefined> | null,
   *  {
   *    "DF": string | number | boolean | null,
   *    "CH": (value: string | number | boolean )=>boolean,
   *    "FK": string
   *  }
   * ]>>} tables 
   */
  constructor(tables){
    // guardando argumentos
    this.#tables = tables;

    /* 
      valores predefinidos 
    */
    this.#valueDefaultArg();

    /*
      comprobacion y creacion de existencia de directorio
    */
    this.#dirDatabase = new WriteReadFile({
      create: Boolean(this.#tables),
      isEncryptable: this.#config.QUERY.ENCRYP,
      dirFolder: this.#config.QUERY.DIRDATABASE, 
      space: this.#config.QUERY.SPACE,
      secret: this.#config.QUERY.SECRET
    });
    
    /* 
      controlador de la data Query
    */
    this.#controllerQuery();
    
    /* 
      controlador de historial logger
    */
    let LoggerDir = new DirLogger(this.#config);
    
    this.#Logger = LoggerDir.file(true, "historial.txt");
    
    if(this.#config.LOGGER.STATUS)
      this.#Logger.log(`[Proceso DarkRest] [DarkRest]: Logger Historial`);
    
  }
  #valueDefaultArg(){
    if(! Object.isObject(this.#config))
      return "EL ARGUMENTO DE CONFIGURACION DEBE SER UN OBJETO {clave: valor}.";

    let {
      ENQUEUE,
      VIEWS,
      
      DIRDATABASE,
      SPACE,

      ENCRYP,
      SECRET,
    } = this.#config.QUERY;

    // config.syncQuequ
    this.#config.QUERY.ENQUEUE 
      = typeof ENQUEUE === 'boolean'
        ? this.#config.QUERY.ENQUEUE
        : false;

    // config.view
    this.#config.QUERY.VIEWS 
      = typeof VIEWS === 'boolean'
        ? this.#config.QUERY.VIEWS
        : false;

    // config.encryp
    this.#config.QUERY.ENCRYP 
      = typeof ENCRYP === 'boolean'
        ? this.#config.QUERY.ENCRYP
        : false;
    
    // config.encryp
    this.#config.QUERY.SECRET
      = typeof SECRET === 'string'
        ? this.#config.QUERY.SECRET
        : false;

    // config.dirDatabase
    this.#config.QUERY.DIRDATABASE 
      = typeof DIRDATABASE === 'string'
        ? resolve(this.#config.QUERY.DIRDATABASE, "tables")
        : resolve("database", "tables");

    // config.space
    this.#config.QUERY.SPACE 
      = typeof SPACE === 'number'
        ? this.#config.QUERY.SPACE
        : 0;

    let {
      STATUS,
      DIRLOGGER,
      GMT
    } = this.#config.LOGGER;

    // config.logHistorial
    this.#config.LOGGER.STATUS 
      = typeof STATUS === 'boolean'
        ? this.#config.LOGGER.STATUS
        : false;

    // config.dirlogger¡
    this.#config.LOGGER.DIRLOGGER 
      = typeof DIRLOGGER === 'string'
        ? resolve(this.#config.LOGGER.DIRLOGGER)
        : resolve("log");
    
    // config.utc
    this.#config.LOGGER.GMT
      = typeof GMT === 'number'
        ? this.#config.LOGGER.GMT
        : 0;
    
    let {
      HOST,
      PORT,
      PASS,
      URL
    } = this.#config.LOGIN;

    //estableciendo una propiedad url
    if(!URL){
      if(HOST.includes('http://localhost')) 
        this.#config.LOGIN.URL = `${HOST}:${PORT}`;
      else if(HOST.includes('localhost')) 
        this.#config.LOGIN.URL = `http://${HOST}:${PORT}`;
      else 
        this.#config.LOGIN.URL = `${HOST}`;
    }
  }
  #controllerQuery(){
    try{
      let fileStockTables = this.#dirDatabase.file(true, '../stockTables.json');
      let dataStockTables = fileStockTables.require((e)=>{
        return {};
      });

      this.#tables = {
        ...dataStockTables,
        ...this.#tables
      };

      this.#tables.__filterPromise(async (ruleTable, table)=>{
        // si la regla igresada no es un objeto, no array
        if(! Object.isObject(ruleTable))
          return false;
  
        // si no exsite esta tabla en la stockTables
        if( !dataStockTables.__property(table))
        dataStockTables[table] = {
            status: true,
            rules: ruleTable
          };
  
        // si el estado de la tabla no es activo
        if(! dataStockTables[table].status)
          return false;
  
        // si se modifico las reglas
        if(
          ! dataStockTables[table].rules.__compare(ruleTable)
          && await prompt(
            Colors.brightBlue(
              `Las reglas de la tabla "${table} se an modificado deas proseguir el formateo? (si/no)"`
            )
          ) === "si"
        )
        dataStockTables[table].rules = ruleTable;
        
  
        return true;
      }).then((newTablesFilter)=>{
        newTablesFilter.__forEach((ruleTable, table)=>{
          
          let fileData = this.#dirDatabase.file(true, `${table}`,`data.json`);
          
          fileData.write(
            fileData.require((e)=>{
              return [];
            })
          )
          // archivo de la tabla
          let fileConstraints = this.#dirDatabase.file(true, `${table}`,`constraints.json`);
  
          // lectura de la tabla y estableciendo sus valores predefinidos
          let dataConstraints = fileConstraints.require((e)=>{
            return {
              type: {},
              NN: {},
              PK: {},
              AI: {},
              UQ: {},
              DF: {},
              FK: {},
              CH: {},
              CI: {}
            }
          });
      
          // validacion de propiedades de las columnas
          if(
            ! ruleTable.__every((property, nameColumm)=>{
              // cancelar si incluye "_"
              if( nameColumm.includes("_"))
                return false;
      
              // cancelar si no es un array
              if(! Array.isArray(property))
                return false;
      
              // si el tipo de de valor no esta en los permitidos
              if(! this.#rules.type[property[0]])
                return false;
              //guargando...
              dataConstraints.type[nameColumm] = property[0];
      
              // para las restricciones dinamicas
              if(
                Array.isArray(property[1]) 
                && ! property[1].every((inputConstraints)=>{
                  if(! this.#rules.constraint.__property(inputConstraints))
                    return false;
  
                  dataConstraints
                    = this.#rules.constraint[inputConstraints](
                      dataConstraints,
                      nameColumm
                    );
                  
                  return true
                })
              )
                return false;
              
              if(
                Object.isObject(property[2])
                && ! property[2].__every((value, inputStaticConstraints)=>{
                  if(! this.#rules.static.__property(inputStaticConstraints))
                    return false;
                  
                  dataConstraints
                    = this.#rules.static[inputStaticConstraints](
                      dataConstraints,
                      nameColumm,
                      value,
                      newTablesFilter
                    );
  
                  return true
                })
              )
                return false;
              // para las restricciones staticas
              return true
            })
          )
            return false;
          
          fileConstraints.write(dataConstraints)
        })
        fileStockTables.write(dataStockTables);
      });

    }catch(e){
      throw this.#Logger.err(e);
    }
  }
  /**
   * servidor
   * @param  { ...string } users 
   */
  apiRest(...users){
    return new ApiRest(
      users, 
      this.#config,
      this.query(),
      this.#Logger
    );
  }
  /**
   * consulter
   * @param { string } user 
   * @returns 
   */
  client(user){
    return new Client(
      this.#config,
      user    
    )
  }
  /**
   * offline
   * @param {(err: string)=>{}} callback
   * @returns { Query }
   */
  query(callback = ()=>{}){
    if(!this.#tables)
      return callback("LAS TABLAS ESTAN VACIAS EN EL CONSTRUCTOR");
    return new Query({
      dirDatabase: this.#dirDatabase,
      config: this.#config,
      logger: this.#Logger,
    })
  }
}

module.exports = DarkRest;