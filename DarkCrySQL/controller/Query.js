const { existsSync, unlinkSync, readdirSync } = require('fs');
const { resolve } = require('path');

const Database = require('./DataCrud');
const { WriteReadFile } = require('../func/BrowsePath');
const { Logger } = require('../func/Logger');


const config = require('../config');

class Queue {
  #queue = [];
  /**
   * Este método agregará un nuevo elemento al final de la cola.
   * @param { ()=>{} } func 
   * @param { * } params 
   */
  enqueue(func, ...params){
    if(typeof func === 'function')
      this.#queue.splice(0, 0, {
        func: func,
        params: params
      });
  }
  /**
   * Este método retira un elemento del principio de la cola.
   * @returns { {
   *  func: ()=>{},
   *  params: []
   * } } 
   */
  dequeue(){
    return this.#queue.pop();
  }
  /**
   * @param { number } time 
   */
  async #delay(time){
    return new Promise((res)=>{
      setTimeout(()=>{
        res(true);
      }, time);
    })
  }
  /**
   * @param { boolean } status 
   */
  async on(status){
    while(status){
      //si la cola no esta vacia
      if(this.#queue.length){
        //si el escritor no esta activo
        let { func, params } = this.dequeue();

        func(...params);
      }
      //si la cola esta vacia
      else 
        await this.#delay(100);
    }
  }
}

class Query {
  #dirDatabase;
  #config;
  #logger;
  #chache = {};
  #whereOption = {
    bollean:{
      "&&":   (val1, val2)=> val1&&val2 ,
      "||":   (val1, val2)=> val1||val2 ,
    },
    inequal:{//val1:DB, val2:Quest
      ">=":   (val1, val2)=> val1>=val2 ,
      "<=":   (val1, val2)=> val1<=val2 ,
      
      ">":    (val1, val2)=> val1> val2 ,
      "<":    (val1, val2)=> val1< val2 ,
      
      //igualdad
      "==":   (val1, val2)=> val1==val2 ,
      "!=":   (val1, val2)=> val1!=val2 ,
      
      //igualdad exacta
      "===":  (val1, val2)=> val1===val2 ,
      "!==":  (val1, val2)=> val1!==val2 ,
      
      //inclusion
      "~":    (val1, val2)=> `${val1}`.toLowerCase().includes(`${val2}`.toLowerCase()) ,
      "!~":   (val1, val2)=> ! `${val1}`.toLowerCase().includes(`${val2}`.toLowerCase()) ,
      
      //inclusion exacta
      "~~":   (val1, val2)=> `${val1}`.includes(`${val2}`) ,
      "!~~":  (val1, val2)=> ! `${val1}`.includes(`${val2}`) ,
      
      //inclusion inicial
      "~=":   (val1, val2)=> `${val1}`.toLowerCase().startsWith(`${val2}`.toLowerCase()) ,
      "!~=":  (val1, val2)=> ! `${val1}`.toLowerCase().startsWith(`${val2}`.toLowerCase()) ,
      
      //inclusion inicial exacta
      "~~=":  (val1, val2)=> `${val1}`.startsWith(`${val2}`) ,
      "!~~=": (val1, val2)=> ! `${val1}`.startsWith(`${val2}`) ,
      
      //inclusion final
      "=~":   (val1, val2)=> `${val1}`.toLowerCase().endsWith(`${val2}`.toLowerCase()) ,
      "!=~":  (val1, val2)=> ! `${val1}`.toLowerCase().endsWith(`${val2}`.toLowerCase()) ,
      
      //inclusion final exacta
      "=~~":  (val1, val2)=> `${val1}`.endsWith(`${val2}`) ,
      "!=~~": (val1, val2)=> ! `${val1}`.endsWith(`${val2}`) ,

      //cuantas palabras tiene
      "_?":   (val1, val2)=> val1.length === val2,
      //empieza y termina contador
      "_._._":(val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0], val2[1]) &&  `${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_._!_":(val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0], val2[1]) && !`${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_!_._":(val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0], val2[1]) &&  `${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_!_!_":(val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0], val2[1]) && !`${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      
      //empieza y termina contador
      "._.":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0]) &&  `${val1}`.endsWith(val2[0][1])): false},
      "._!":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0]) && !`${val1}`.endsWith(val2[0][1])): false},
      "!_.":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0]) &&  `${val1}`.endsWith(val2[0][1])): false},
      "!_!":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0]) && !`${val1}`.endsWith(val2[0][1])): false},
      
      //contiene contador
      "_._":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return (`${val1}`.startsWith(val2[0][0], val2[1]) && `${val1}`.endsWith(val2[0][0], val1.length - val2[3]))},
      "_!_":  (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return ! (`${val1}`.startsWith(val2[0][0], val2[1]) && `${val1}`.endsWith(val2[0][0], val1.length - val2[3]))},
      
      //termina contador
      "._":   (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return `${val1}`.endsWith(val2[0][0], val1.length - val2[3])},
      "!_":   (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return ! `${val1}`.endsWith(val2[0][0], val1.length - val2[3])},
      
      //empieza contador
      "_.":   (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return `${val1}`.startsWith(val2[0][0], val2[1])},
      "_!":   (val1, val2)=>{ val2 = this.#chache[val2] || this.#counter(val2, '_'); return ! `${val1}`.startsWith(val2[0][0], val2[1])},
    }
  };
  #queue = new Queue();
  /**
   * @param {{
   *   config: config
   *   dirDatabase: WriteReadFile
   *   logger: Logger
   * }} input
   */
  constructor({ dirDatabase, config, logger }){
    this.#dirDatabase = dirDatabase;
    this.#config = config;
    this.#logger = logger;
    this.#queue.on(this.#config.QUERY.ENQUEUE);
  }
  /**
   * @param { string } str2 
   * @param { string } cound 
   * @return { [str: string, start: number, mid: number, end: number, length: number] }
   */
  #counter(str2, cound){

    let str = str2;
    let start = 0;
    let mid = 0;
    let end = 0;
    let length = 0;

    str2 = str2.split(cound).flatMap((x, i, a)=>{
      if(str2.startsWith(cound)){ start++; length++; str2 = str2.slice(1) } 
      else if(str2.endsWith(cound)){ end++; length++; str2 = str2.slice(null, str2.length - 1) }
      else if(str2.includes(cound)){ mid++; length++; str2 = str2.replace('_','')}
      if(x=='') return [];
      else length += x.length;
      return x;
    })
    return this.#chache[str] = [str2, start, mid, end, length];
  }
  /**
   * ?==========================
   * ?============= WHERE ==========
   * ?==========================
   * @param { [...string] | (tb)=>[] } where 
   * @param { {} } db 
   */
  #where(where, db){

    if(!where) 
      return true;
    if(typeof where === 'function') 
      where = where(db);
    if(! Array.isArray(where)) 
      return true;
    if(! where.length) 
      return true;

    // ineq - bool
    let ineq = [], bool = [];

    // metodos por posicion del arreglo where
    let optionWhere = {
      // ! Property Table
      "0": (value)=>{
        if(db.hasOwnProperty(String(value))) 
          ineq.push(db[value]);
        else 
          ineq.push(value);

        return true
      },
      // ! Compare
      "1": (value)=>{
        if(! this.#whereOption.inequal.__property(value)) 
          throw (`NO EXISTE LA DESIGUALDAD: "${value}"`);

        if(ineq.length !== 1)
          throw (`MALA SINTAXIS DE DESIGUALDAD "${value}"`);
        
        ineq.push(value);
        return true;
      },
      // ! Value
      "2": (value)=>{
        if(this.#whereOption.bollean.__property(value) || this.#whereOption.inequal.__property(value))
          throw (`NO EXISTE LA DESIGUALDAD: "${value}"`);          
        
        if(db.hasOwnProperty(String(value))) 
          ineq.push(db[value]);
        else 
          ineq.push(value);

        if(ineq.length === 3){
          bool.push(
            this.#whereOption.inequal[ineq[1]](
              ineq[0],
              ineq[2]
            )
          );
        }
        if(bool.length === 3){
          bool = [
            this.#whereOption.bollean[bool[1]](
              bool[0],
              bool[2]
            )
          ];
        }

        return true
      },
      // ! Copare Boolean
      "3": (value)=>{
        if(! this.#whereOption.bollean.__property(value)) 
          throw (`NO EXISTE ESTA COMPARACION BOOLEANA: "${value}"`);
        
        if(bool.length !== 1)
          throw (`MALA SINTAXIS PARA UNA COMPARACION BOLLEANA: "${value}"`);
        
        ineq = [];
        bool.push(value);
        if(bool[0] && bool[1] == '||'){
          bool = [true];
          return false;
        }
        return true;
      }
    }
    where.every((value, index) => {
      return optionWhere[index % 4](value);
    })

    return bool[0];
  }
  /**
   * @param { Object.<string, string | number | boolean> } dataRows 
   * @param {Array.<{
   *  foreingKey: string,
   *  select: string
   * }>} joins 
   * @param {{
   *  type: Object.<string, "string" | "number" | "boolean">,
   *  NN: Object.<string, boolean>,
   *  PK: Object.<string, boolean>,
   *  AI: Object.<string, number>,
   *  UQ: Object.<string, Object.<string, number>>,
   *  DF: Object.<string, string | number | boolean>,
   *  FK: Object.<string, string>,
   *  CH: Object.<string, string>,
   *  CI: Object.<string, Object.<string, [...number]>>,
   * }} dataConstraints 
   * @returns 
   */
  #join(dataRows, joins, dataConstraints){
    try{
      for (let i = 0; i < joins.length; i++) {
        
        let join = joins[i];
        
        let { foreingKey, select } = join;


        if(! dataConstraints.FK.__property(foreingKey))
          throw `"${foreingKey}" NO ES UNA LLAVE FORANEA`;
  
        let { "0": tableFK,"1": colummFK } = dataConstraints.FK[foreingKey];
  
        let valueFK = dataRows[foreingKey];

        this.getyng(tableFK)
          .select('*')
          .index({
            [colummFK]: valueFK
          })
          .end((err, resp)=>{
            if(err) 
              throw(err);

            if(!resp[0]?.__property(select))
              throw `"${select}" NO EXISTE ESTA COLUMNA EN LA TABLA "${tableFK}`;
            
            dataRows[foreingKey] = resp[0][select];
          })
      }
      return dataRows
    }catch(e){
      throw `[join] ${e}`
    }
  }
  /**
   * @param {string} fileName 
   * @returns 
   */
  #file(folderTable){
    let fileStockTables = this.#dirDatabase.file(false, '../stockTables.json');
    
    if(! fileStockTables.require().__property(folderTable))
      throw `NO EXISTE ESTA TABLA "${folderTable}"`;

    return {
      /**
       * @type {{
       *  read: (callback: (err: string)=>{})=>Object.< string, Object.< string, [
       *    "string" | "number" | "boolean",
       *    Array.<"AI" | "UQ" | "NN" | "PK" | "CI" | undefined> | null,
       *    {
       *      "DF": string | number | boolean | null,
       *      "CH": (value: string | number | boolean )=>boolean,
       *      "FK": string
       *    }
       *  ]>>,
       *  require: (callback: (err: string)=>{})=>Object.< string, Object.< string, [
       *    "string" | "number" | "boolean",
       *    Array.<"AI" | "UQ" | "NN" | "PK" | "CI" | undefined> | null,
       *    {
       *      "DF": string | number | boolean | null,
       *      "CH": (value: string | number | boolean )=>boolean,
       *      "FK": string
       *    }
       *  ]>>,
       *  write: (data: *, callback: (err: string)=>{})=>boolean
       * }}
       */
      stockTables: fileStockTables,
      /**
       * @type {{
       *  read: (callback: (err: string)=>{})=>{
       *   type: Object.<string, "string" | "number" | "boolean">,
       *   NN: Object.<string, boolean>,
       *   PK: Object.<string, boolean>,
       *   AI: Object.<string, number>,
       *   UQ: Object.<string, Object.<string, number>>,
       *   DF: Object.<string, string | number | boolean>,
       *   FK: Object.<string, string>,
       *   CH: Object.<string, string>,
       *   CI: Object.<string, Object.<string, [...number]>>,
       *  },
       *  require: (callback: (err: string)=>{})=>{
       *   type: Object.<string, "string" | "number" | "boolean">
       *   NN: Object.<string, boolean>,
       *   PK: Object.<string, boolean>,
       *   AI: Object.<string, number>,
       *   UQ: Object.<string, Object.<string, number>>,
       *   DF: Object.<string, string | number | boolean>,
       *   FK: Object.<string, string>,
       *   CH: Object.<string, string>,
       *   CI: Object.<string, Object.<string, [...number]>>,
       *  },
       *  write: (data: *, callback: (err: string)=>{})=>boolean
       * }}
       */
      constraints: this.#dirDatabase.file(false, folderTable, 'constraints.json'),
      /**
       * @type {{
       *  read: (callback: (err: string)=>{})=>[...{}],
       *  require: (callback: (err: string)=>{})=>[...{}],
       *  write: (data: *, callback: (err: string)=>{})=>boolean
       * }}
       */
      tableData: this.#dirDatabase.file(false, folderTable, 'data.json')
    };
  }
  
  /**
   * @param { [...string] } select 
   * @param { {} } dbObject 
   * @param { number } index 
   * @returns 
   */
  #filterColumm(select, dbObject, index){
    //si el argumento es todo
    if(select.some(e=>e ==='*')) 
      return dbObject;

    let dataRow = {};

    select.forEach((selectKey)=>{
      if(!selectKey) 
        throw ('UN PARAMETRO DEL SELECTRO DE COLUMNAS ESTA VACIO');

      let not = selectKey.includes('!')
        ? selectKey = selectKey.split('!').join('')
        : null;

      if(!dbObject.__property(selectKey))
        throw (`NO EXISTE LA PROPIEDAD "${selectKey}" EN LA DATA DE LA TABLA "${table}"`);

      let { [selectKey] : name, ...notname } = dbObject;

      if(not) 
        dbObject = notname;
      else 
        dataRow[selectKey] = name;
    });
    return Object.keys(dataRow).length
      ? dataRow 
      : error
        ? [] 
        : dbObject;
  }
  /**
   * @param { ()=>[...{}] } func
   */
  async #isEnqueue(func, ...params){
    if(this.#config.QUERY.ENQUEUE)
      this.#queue.enqueue(func, ...params);
    else
      return await func(...params);
  }
  /**
   * @param { string } table 
   * @example
   * "*" todas las tablas
   * "nameTable" nombre de la tabla en especifico
   */
  types(...tables){
    let InputParams = new Map();
    InputParams.tables = tables;

    /**
     * @param { {
     *   tables: [...string],
     *   select: string,
     *   callback: (err: string, resp: {})=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let {
          tables,
          callback
        } = Params;
        
        try{

          let TYPES = {};

          tables.forEach((table)=>{
            let { constraints } = this.#file(table);

            let dataConstraints = constraints.read();

            TYPES[table] = dataConstraints.type
          });

          if(callback)
            callback(null, TYPES);
          else
            return TYPES;
        }catch(e){
          if(callback)
            callback(`[TYPES] ${e}`);
          else
            throw (`[TYPES] ${e}`);
        }
      }
      return this.#isEnqueue(run);
    };

    class End{
      /**
       * @param { (err: string, resp: {})=>{} } callback 
       * @returns 
       */
      end(callback){
        InputParams.callback = callback;
        return send(InputParams);
      }
    }

    return new End()
  }
  /**
   * @param { string } tabla 
   */
  insert(table){
    /**
     * @type {{
     *   table: string,
     *   data: [...{}],
     *   callback: (err: string, resp: [...{}])=>{},
     * }} Params
     */
    let InputParams = new Map();
    InputParams.table = table;
    /**
     * @param { InputParams } Params
    */
    let send = async (Params)=>{
      let run = async ()=>{

        let { 
          table,
          datas,
          callback 
        } = Params;

        try{

          let { constraints, tableData } = this.#file(table)

          let dataConstraints = constraints.read();
          let dataTableData = tableData.read();
          
          let INSERT = [];

          datas.forEach((data)=>{
            let index = dataTableData.length;
            let dataInsert = {};

            dataConstraints.type.__forEach((type, nameColumm)=>{
              // ! valor null<object JSON>
              let value = data[nameColumm] ?? null;
              
              if(!value){
                // ? DF
                if(dataConstraints.DF.__property(nameColumm))
                  value = dataConstraints.DF[nameColumm];
                
                // ? NN
                if(dataConstraints.NN.__property(nameColumm))
                  throw `[not null] EL VALOR DE LA COLUMNA "${nameColumm}" NO PUEDE SER NULA`;
                
                // ? AI
                if(dataConstraints.AI.__property(nameColumm))
                  value = dataConstraints.AI[nameColumm] += 1;
              }

              // ? TYPE
              if(value && typeof value !== type)
                throw `[type] "${nameColumm}: ${value}" NO ES DEL TIPO DE VALOR <${type}>`;

              // ? CH
              if(dataConstraints.CH[nameColumm] && ! (eval(dataConstraints.CH[nameColumm]))(value))
                throw `[check] "${nameColumm}: ${value}" NO CUMPLE CON LA RESTRICCION DE VALIDACION`;

              if(value){
                // ? UQ
                if(dataConstraints.UQ.__property(nameColumm)){
                  if(dataConstraints.UQ[nameColumm].__property(value))
                    throw `[unique] EL VALOR "${value}" YA EXISTE, ES REDUNDANTE Y NO UNICO`;
                  dataConstraints.UQ[nameColumm][value] = index;
                }
  
                // ? CI
                if(dataConstraints.CI.__property(nameColumm)){
                  if(! dataConstraints.CI[nameColumm].__property(value))
                    dataConstraints.CI[nameColumm][value] = [];
                  dataConstraints.CI[nameColumm][value].push(index);
                }
  
                // ? FK
                if(dataConstraints.FK.__property(nameColumm)){
                  let { "0": tableFK,"1": colummFK } = dataConstraints.FK[nameColumm];
                  let { constraints: constraintsFK } = this.#file(tableFK);
                  let dataconstraintsFK = constraintsFK.read();
  
                  if(! dataconstraintsFK.UQ[colummFK].__property(value))
                    throw `[foreign key] LA CLAVE "${value}" AUN NO EXISTE EN LA TABLA ${tableFK} COLUMNA ${colummFK}`;
                }
              }

              dataInsert[nameColumm] = value;
            })

            dataTableData.push(dataInsert);
            INSERT.push(dataInsert);
          });
          
          constraints.write(dataConstraints);
          tableData.write(dataTableData);

          if(callback)
            return callback(null, INSERT);
          else
            return INSERT;
          
        }catch(e){
          if(callback)
            return callback(`[INSERT] ${e}.`);
          else
            throw this.#logger.err(`[INSERT] ${e}.`);
        }
      };
      return await this.#isEnqueue(run);
    };

    //rutas
    class End {
      /**
       * @param { (err: string, resp: [...{}])=>{} } callback 
       */
      async end(callback){
        InputParams.callback = callback;
        return await send(InputParams);
      };
    }

    class Data$End {
      /**
       * @param { ...Array<Object<string|number|boolean>> } datas 
       * @returns { End }
       */
      data(...datas){
        InputParams.datas = datas;
        return new End();
      }
    };

    return new Data$End;

  }
  /**
   * @param { string } table Este paremetro acepta el nombre de una tabla existente.
   * @param { ? "*" | "**" } selectRows Seleccionador de filas.
   * @example
   * ( nameTable<string> ): Segundo parametro opcional.
   * ( nameTable<string>, "*" ): Devuelve todas las filas, existentes y en pareleras.
   * ( nameTable<string>, "**" ): Devuelve todas las filas, existentes, en pareleras y eliminadas.
   */
  getyng(table, selectRows){
    /**
     * @type {{
     *   table: string,
     *   selectRows: string,
     *   select: Array.<string>,
     *   indexs: Array.<Object.<string, string | number >>,
     *   where: [...string | ...number | ...boolean],
     *   join: [...{
     *     foreingKey: string,
     *     select: string
     *   }], 
     *   callback: (err: string, resp: [...{}])=>{},
     * }} Params
     */
    let InputParams = new Map();
    InputParams.table = table;
    InputParams.selectRows = selectRows;
    /**
     * @param { InputParams } Params
     */
    let send = async (Params)=>{
      let run = async ()=>{
        //obteniendo los parametros
        let {
          table,
          selectRows = "",
          select, 
          indexs,
          where, 
          join, 
          callback
        } = Params;

        try{
          
          let { stockTables, constraints, tableData } = this.#file(table)

          let dataStockTables = stockTables.read();
          let dataConstraints = constraints.read();
          let dataTableData = tableData.read();

          /**
           * @type { Object.<number, {}> }
           */
          let GETYNG = {};

          let filterRows = async(dataRows, idx)=>{
            // ? data eliminada
            if(! dataRows){
              if(selectRows.includes('**'))
                return GETYNG[idx] = null;
              return;
            }
            
            // ? data en papelera
            if(Array.isArray(dataRows)){
              // ? requerir los que estan en papelera
              if(selectRows.includes('*'))
                dataRows = dataRows[0];
              else
                return;
            }

            // ? condicion de columnas
            if(! this.#where(where, dataRows))
              return;

            dataRows = this.#filterColumm(select, dataRows, idx)

            if(join?.length)
              GETYNG[idx] = this.#join(dataRows, join, dataConstraints);
            else
              GETYNG[idx] = dataRows;
          }

          let search = async (data)=>{

            let dataLength = data.length - 1;
  
            for(let idx = 0; idx < dataLength; idx++){
              filterRows(data[idx], idx);
            };

            await filterRows(data[dataLength], dataLength );

            return Object.values(GETYNG);
          }

          if(indexs?.length){
            let change = [];
            indexs.forEach((index)=>{
              if(Object.isObject(index))
                index.__forEach((value, columm)=>{
                  if(! (dataConstraints.UQ.__property(columm) || dataConstraints.CI.__property(columm)))
                    throw `NO EXISTE LA COLUMNA "${columm}" CON PROPIEDAD "UQ" O "CI" `;
                  if(dataConstraints.UQ[columm]?.__property(value)){
                    let idx = dataConstraints.UQ[columm][value];
                    change[idx] = dataTableData[idx];
                  }
                  else if(dataConstraints.CI[columm]?.__property(value)){
                    dataConstraints.CI[columm][value].forEach((idx)=>{
                      change[idx] = dataTableData[idx];
                    })
                  }
                })
            })
            dataTableData = change;
          }

          let resp = search(dataTableData);

          if(callback)
            return callback(null, await resp);
          else
            return await resp;
        }catch(e){
          if(callback)
            return callback(e);
          else
            throw this.#logger.err(`[GETYNG] ${e}`);
        }
        /* 
        //verificando si exite la db
        let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${table}.json`);
        if(!existsSync(dirDB)) 
          throw (`No existe la tabla: ${table} .`);
        //consultando la lectura
        let res = new Database(
          dirDB,
          this.#config.QUERY.SPACE,
          this.#config.QUERY.ENCRYP,
          this.#config.QUERY.SECRET
        )
          .read(
            selectRows,
            select, 
            id,
            where,
            (err, resp)=>{
              if(err) 
                throw (err);
              //si existe join
              if(join){
                //mapeando la respuesta si existe el join
                resp = resp.map((rowObj)=>{
                  //iterando join
                  join.forEach((param)=>{
                    if(typeof param === 'object' && !Array.isArray(param)){
                      //parametros de join
                      let {
                        set: setJoin,
                        get: getJoin,
                        id: idJoin,
                        where: whereJoin,
                        end: endJoin
                      } = param;
                      
                      //necesario el fin del join
                      if(!endJoin) return;
                      //verificando si exite la db
                      let dirJoinDB = resolve(this.#config.QUERY.DIRDATABASE, `${getJoin}.json`);
                      if(!existsSync(dirJoinDB)) 
                        return callback(`[JOIN] NO EXISTE LA TABLA: ${getJoin} .`);

                      idJoin = typeof idJoin !== 'function' 
                        ? null
                        : idJoin(rowObj);
                        
                      whereJoin = typeof whereJoin !== 'function'
                        ? null
                        : whereJoin(rowObj);
                        
                      //consultando la lectura
                      new Database(
                        dirJoinDB,
                        this.#config.QUERY.SPACE,
                        this.#config.QUERY.ENCRYP,
                        this.#config.QUERY.SECRET
                      )
                        .read(
                          null,
                          ['*'],
                          idJoin,
                          whereJoin,
                          (error, result)=>{
                            if(error) 
                            callback(error);
                            else{
                              if(!result.length)
                                return callback(`[JOIN] NO ENCONTRO COINCIDENCIA EN LA TABLA "${getJoin}"`);
                              //asignando la a la propiedad setJoin el resultado de endJoin
                              if(!rowObj.hasOwnProperty(setJoin)) 
                                return callback(`[JOIN] NO EXISTE LA PROPIEDAD "${setJoin}" EN "${table}"`);
                              rowObj[setJoin] = endJoin(result[0]);
                            }
                          }
                        )
                    }
                  })
                  //reasignand el olbjeto modificado por el join
                  return rowObj;
                })
              }
              return resp;
            }
          );
        if(callback)
          callback(null, res);
        else
          return res;
       */
      };
      return await this.#isEnqueue(run);
    }

    //rutas
    class End {
      /**
       * @param { (err: string, resp: [...{}])=>void } callback 
       */
      async end(callback){
        InputParams.callback = callback;
        return await send(InputParams);
      }
    }
    
    class Join$End_End extends End{
      /**
       * @param { ...{
       *  foreingKey: string
       *  select: string
       * } } join 
       */
      join(...join){
        InputParams.join = join; 
        return new End()
      }
    }
    
    class Where$Join$End_Where$End_Join$End_End extends Join$End_End{
      /**
       * @typedef { [
       *  string, 
       *  '===' | '!==' | '==' | '!=' | '>=' | '<=' | '>' | '<' | '~~' | '!~~' | '~' | '!~' | '~=' | '!~=' | '~~=' | '!~~=' | '=~' | '!=~' | '=~~' | '!=~~' | '_?' | '_._._' | '_._!_' | '_!_._' | '_!_!_' | '._.' | '._!' | '!_.' | '!_!' | '_._' | '_!_' | '._' | '!_' | '_.' | '_!',
       *  any,
       *  '&&' | '||'
       * ] } WHERE
       * @param { [...WHERE, ...WHERE, ...WHERE, ...WHERE, ...WHERE, ...WHERE]} where 
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
        if(where.length == 1 && typeof where[0] === 'function')
          InputParams.where = where[0];
        else
          InputParams.where = where;
        return new Join$End_End();
      }
    }

    class Index$Where$Join$End_Index$Where$End_Index$Join$End_Index$End_Where$Join$End_Where$End_Join$End_End extends Where$Join$End_Where$End_Join$End_End {
      /**
       * @param { Array.<Object.<string, string | number >> } index 
       */
      index(...indexs){
        InputParams.indexs = indexs;
        return new Where$Join$End_Where$End_Join$End_End();
      }
    }
    
    class Select$Where$Join$End_Select$Where$End_Select$Join$End_Select$End{
      /**
       * @param  {Array<"*", string>} select seleccionador de columnas
       * @example 
       * "*" selecciona todas las columnas
       */ 
      select(...select){
        InputParams.select = select; 
        return new Index$Where$Join$End_Index$Where$End_Index$Join$End_Index$End_Where$Join$End_Where$End_Join$End_End();
      }
    }

    return new Select$Where$Join$End_Select$Where$End_Select$Join$End_Select$End()
  }
  /**
   * @param { string } table 
   */
  update(table){
    let InputParams = new Map();
    InputParams.table = table;
    /**
     * @param { {
     *   table: string,
     *   select: [...string],
     *   id: string,
     *   where: [...string],
     *   clear: [...string]
     *   set: {}
     *   callback: (err: string, resp: [...{}])=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let { 
          table, 
          select, 
          id,
          where, 
          clear,
          set, 
          callback 
        } = Params;
  
        if(!callback) return;
  
        try{
          let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${table}.json`);
          if(!existsSync(dirDB))
            return callback(`No existe la tabla: ${table} .`);
          let res = new Database(
            dirDB,
            this.#config.QUERY.SPACE,
            this.#config.QUERY.ENCRYP,
            this.#config.QUERY.SECRET
          )
            .update(
              select,
              id,
              where,
              clear,
              set,
              (err, resp)=>{
                if(err)
                  throw err;
                return resp;
              }
            );

          if(callback)
            callback( null, res);
          else
            return res;
        }catch(e){
          if(callback)
            callback(`[UPDATE] ${e}`);
          else
            throw (`[UPDATE] ${e}`);
        }
      };
      return this.#isEnqueue(run);
    }

    //rutas

    class End {
      /**
       * @param { (err: string, resp: [...{}])=>{} } callback 
       */
      end(callback){
        InputParams.callback = callback;
        return send(InputParams); 
      }
    }
    
    class Set$End {
      /**
       * @param  { {} } set 
       */
      set(set){
        InputParams.set = set; 
        return new End()
      }
    }
    
    class Where$Set$End_Set$End extends Set$End{
      where(where){
        InputParams.where = where; 
        return new Set$End()
      }
    }
    
    class Index$Where$Set$End_Index$Set$End_Where$Set$End {
      /**
       * @param { Array.<Object.<string, string | number >> } index 
       */
      index(index){
        InputParams.index = index; 
        return new Where$Set$End_Set$End()
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
      where(where){
        InputParams.where = where;  
        return new Set$End()
      }
    }
    
    class Select$Index$Where$Set$End_Select$Index$Set$End_Select$Where$Set$End {
      /**
       * @param { ...string } select 
       * @examples 
       * ""vacio, segun metodo set(object) actualizara las propiedades, no elimina todo
       * "*" actualiza todo, eliminando todo lo anterior
       */
      select(select){
        InputParams.select = select; 
        return new Index$Where$Set$End_Index$Set$End_Where$Set$End()
      }
    }
    
    return new Select$Index$Where$Set$End_Select$Index$Set$End_Select$Where$Set$End();

  }
  /**
   * @param { string } table
   * @param { boolean } definitive este parametro es opcional significa 
   * si se establece en "true" la eliminacion definitiva de esos datos en la db 
   */
  delete(table, definitive){
    let InputParams = new Map();
    InputParams.table = table;
    InputParams.definitive = definitive;
    /**
     * @param { {
     *     table: string,
     *     id: number,
     *     where: [...string],
     *     definitive: boolean,
     *     callback: (err: string, resp: [...{}])=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let { 
          table, 
          id,
          where, 
          definitive,
          callback 
        } = Params;
  
        if(!callback) return;
  
        try{
          let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${table}.json`);
          if(!existsSync(dirDB)) 
            return callback(`No existe la tabla: ${table} .`);
  
          let res = new Database(
            dirDB,
            this.#config.QUERY.SPACE,
            this.#config.QUERY.ENCRYP,
            this.#config.QUERY.SECRET
          )
            .delete(
              id,
              where,
              definitive,
              (err, resp)=>{
                if(err)
                  throw err;
                return resp;
              }
            );
          if(callback)
            callback(null, res);
          else
            return res;
        }catch(e){
          if(callback)
            callback(`[DELETE] ${e}`);
          else
            throw (`[DELETE] ${e}`);
        }
      };
      return this.#isEnqueue(run);
    }

    //rutas

    class End {
      /**
       * @param { (nameTable: Array<Object<string|number|boolean>>)=>{} } callback 
       */
      end(callback){
        InputParams.callback = callback; 
        return send(InputParams);
      }
    }
    
    class Where$End_Id$End {
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
      where(where){
        InputParams.where = where; 
        return new End()
      }
      /**
       * @param { number } id 
       */
      id(id){
        InputParams.id = id; 
        return new End()
      }
    }
    
    return new Where$End_Id$End();

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
     * @param { {
     *   table: [...string],
     *   select: string,
     *   callback: (err: string, resp: {})=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let {
          table,
          select,
          callback
        } = Params;
        
        try{
          if(table.join('').includes('*'))
            table = readdirSync(this.#config.QUERY.DIRDATABASE);
  
          let res = new Map;
  
          table.forEach((name)=>{
            let dirDB = resolve(
              this.#config.QUERY.DIRDATABASE,
              name.endsWith('.json')
                ? name
                : `${name}.json`
            );
  
            if(!existsSync(dirDB)) 
              throw (`No existe la tabla: ${table} .`);
            
            new Database(
              dirDB,
              this.#config.QUERY.SPACE,
              this.#config.QUERY.ENCRYP,
              this.#config.QUERY.SECRET
            )
              .read(
                select,
                null,
                null,
                [],
                (err, resp)=>{
                  if(err) 
                    throw(err);
                  else
                    res[name.split('.json')[0]] = resp.length;
                }
              )
          })
          
          if(callback)
            callback(null, res);
          else
            return res;
        }catch(e){
          if(callback)
            callback(`[LENGHT] ${e}`);
          else
            throw (`[LENGHT] ${e}`);
        }
      };
      return this.#isEnqueue(run);
    }

    //rutes

    class End {
      /**
       * @param { (err: string, resp: {})=>{} } callback 
       * @returns 
       */
      end(callback){
        InputParams.callback = callback;
        return send(InputParams)
      }
    }

    class Select$End {
      /**
       * @param { string } select 
       * @example
       * "***" absolutamente todo
       * "**" todo 
       * "*" todo lo visible
       */
      select(select){
        InputParams.select = select; 
        return new End()
      }
    }

    new Select$End();

  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  rebootTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param { {
     *   nameTable: string,
     *   callback: (err: string, resp: boolean)=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let {
          nameTable,
          callback
        } = Params
  
        try{
          let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${nameTable}.json`);
          if(!existsSync(dirDB))
            throw (`NO EXISTE LA TABLA: ${nameTable} .`); 
  
          new WriteReadFile(
            dirDB, 
            this.#config.QUERY.SPACE,
            this.#config.QUERY.ENCRYP,
            this.#config.QUERY.SECRET
          )
            .write([null]);
  
          if(callback)
            callback(null, true);
          else
            return true;
        }catch(e){
          if(callback)
            callback(`[REBOOTTABLE] ${e}`);
          else
            throw `[REBOOTTABLE] ${e}`;
        }
      };
      return this.#isEnqueue(run);
    }

    //rutes
    class End {
      /**
       * @param { (err: string, resp: {})=>{} } callback 
       * @returns 
       */
      end(end){
        InputParams.end = end; 
        return send(InputParams);
      }
    }

    return new End();

  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  createTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param { {
     *   nameTable: string,
     *   callback: (err: string, resp: boolean)=>{}
     * } } Params
     */
    let send = (Params)=>{
      let run = ()=>{
        let {
          nameTable,
          callback
        } = Params
  
        try{
          let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${nameTable}.json`);
          if(existsSync(dirDB)) 
            throw (`YA EXISTE LA TABLA: ${nameTable}.`);
  
          new WriteReadFile(
            dirDB, 
            this.#config.QUERY.SPACE,
            this.#config.QUERY.ENCRYP,
            this.#config.QUERY.SECRET
          )
            .write([null]);
  
          if(callback)
            callback(null, true);
          else
            return true;
        }catch(e){
          if(callback)
            callback(`[CREATETABLE] ${e}`);
          else
            throw `[CREATETABLE] ${e}`;
        }
      };
      return this.#isEnqueue(run);
    }

    //rutes
    class End {
      /**
       * @param { (err: string, resp: {})=>{} } callback 
       * @returns 
       */
      end(end){
        InputParams.end = end; 
        return send(InputParams);
      }
    }

    return new End();
    
  }
  /**
   * @param {string} nameTable 
   * @returns 
   */
  deleteTable(nameTable){
    let InputParams = new Map();
    InputParams.nameTable = nameTable; 
    /**
     * @param { {
     *   nameTable: string,
     *   callback: (err: string, resp: boolean)=>{},
     * } } Params
     */
    let send = (Params)=>{
      return this.#isEnqueue(()=>{
        let {
          nameTable,
          callback
        } = Params
        
        try{
          let dirDB = resolve(this.#config.QUERY.DIRDATABASE, `${nameTable}.json`);
          if(!existsSync(dirDB)) 
            throw (`NO EXISTE LA TABLA: ${nameTable}.`);
          unlinkSync( dirDB );

          if(callback)
            callback(null, true);
          else
            return true;
        }catch(e){
          if(callback)
            callback(`[DELETETABLE] ${e}`);
          else
            throw `[DELETETABLE] ${e}`;
        }
      });
    }

    //rutes
    class End {
      /**
       * @param { (err: string, resp: {})=>{} } callback 
       * @returns 
       */
      end(end){
        InputParams.end = end; 
        return send(InputParams);
      }
    }

    return new End();

  }
}

module.exports = Query;