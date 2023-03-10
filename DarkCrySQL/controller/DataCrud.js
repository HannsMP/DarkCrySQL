const WriteReadFile = require('../func/BrowsePath');
const Memorization = require('../func/Memorization');

/**
 * made by me, if you like it, don't steal the credits https://github.com/HannsMP
 * hecho por mi, si te gusta no robes los creditos https://github.com/HannsMP
 * @typedef JSONValue
 * @type {(string|number|boolean|Object.<string, JSONValue>|JSONValue[]|null)}
 */
class DataCrud {
  #nameTable
  #File;
  #temp = new Map();
  #whereOption = {
    bollean:{
      "&&":   (val1, val2)=> val1&&val2 ,
      "||":   (val1, val2)=> val1||val2 ,
    },
    inequal:{//valDB valQuest
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
      "_._._":(val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0], val2[1]) &&  `${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_._!_":(val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0], val2[1]) && !`${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_!_._":(val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0], val2[1]) &&  `${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      "_!_!_":(val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0], val2[1]) && !`${val1}`.endsWith(val2[0][1], val2[4]-val2[3]-1)): false},
      
      //empieza y termina contador
      "._.":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0]) &&  `${val1}`.endsWith(val2[0][1])): false},
      "._!":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? ( `${val1}`.startsWith(val2[0][0]) && !`${val1}`.endsWith(val2[0][1])): false},
      "!_.":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0]) &&  `${val1}`.endsWith(val2[0][1])): false},
      "!_!":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return val2[4] == val1.length? (!`${val1}`.startsWith(val2[0][0]) && !`${val1}`.endsWith(val2[0][1])): false},
      
      //contiene contador
      "_._":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return (`${val1}`.startsWith(val2[0][0], val2[1]) && `${val1}`.endsWith(val2[0][0], val1.length - val2[3]))},
      "_!_":  (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return ! (`${val1}`.startsWith(val2[0][0], val2[1]) && `${val1}`.endsWith(val2[0][0], val1.length - val2[3]))},
      
      //termina contador
      "._":   (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return `${val1}`.endsWith(val2[0][0], val1.length - val2[3])},
      "!_":   (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return ! `${val1}`.endsWith(val2[0][0], val1.length - val2[3])},
      
      //empieza contador
      "_.":   (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return `${val1}`.startsWith(val2[0][0], val2[1])},
      "_!":   (val1, val2)=>{ val2 = this.#temp[val2] || this.#counter(val2, '_'); return ! `${val1}`.startsWith(val2[0][0], val2[1])},
    }
  };
  /**
   * *========================== CONSTRUCTOR ==========================
   * @param {string} database Ruta al archivo JSON que se va a crear o usar.
   * @param { number } space spacio en el archivo .json
   * @param { string } pass contraseña
   * @param { (err: string)=>{} } callback confirmacion de ningun error de la construcion 
   */
  constructor(database, space, isEncryptable, pass, callback) {    
    try {
      /* directorio */
      this.#nameTable = database.split('\\').pop().split('.')[0];
      this.#File = new WriteReadFile(
        database, 
        space,
        isEncryptable, 
        pass
      );
    }
    catch(e){
      callback(e);
    }
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
    return this.#temp[str] = [str2, start, mid, end, length];
  }
  /**
   * @param {{}} data 
   * @param {{}} type 
   * @param {(err: string, resp: [...{}])=>{}} callback
   */
  #typeRow(data, type, callback){
    try{
      //si no existe 
      if(!type) 
        return;
  
      //si la data no contiene ningun elemento
      if(!Object.keys(data).length) 
        return;
      //si no existe variable temporal
      if(!this.#temp.emty){
        //variable temporal de la data vacia
        this.#temp.emty = {};
        Object.keys(type).forEach(
          key => this.#temp.emty[key] = null
        );
      } 
  
      data = {
        ...this.#temp.emty,
        ...data
      }
  
      //si la cantidad de elementos de data y elementos de type son iguales
      if(Object.keys(data).length !== Object.keys(type).length) 
        return;

      //si todos los elementos cumplen las condicienes de type
      Object.keys(data).every( key => {
        if(type[key] === 'any') 
          return true;
        if(!data[key]) 
          return true;
        if(typeof data[key] === type[key]) 
          return true;
        else 
          throw `ERROR EN EL TIPO DE DATO \n{"${key}": "${data[key]}"},\nSE CANCELO LA INSERCION\n${JSON.stringify(data, null, 2)}`;
      });
  
      callback(null, data);
    }catch(e){
      callback(`[TYPEDATA]] ${e}`);
    }
  }
  /**
   * ?==========================
   * ?============= WHERE ==========
   * ?==========================
   * @param { [...string] } where 
   * @param { {} } db 
   * @param {(err: string ,resp: object)=>{}} callback 
   */
  #where(where, db, callback){
    if(!where) 
      return true;
    if(typeof where[0] === 'function') 
      where = where[0](db);
    if(! Array.isArray(where)) 
      return true;
    if(! where.length) 
      return true;
    
    try{
      // ineq - bool
      let ineq = [], bool = [];
      // resp
      where.every((x, i) => {
        // verificando existencia de operadores bolleano
        if((i % 4) - 3 === 0 && x){
          if(! this.#whereOption.bollean.hasOwnProperty(x)) 
            throw (`NO EXISTE ESTA COMPARACION BOOLEANA: "${x}"`);
          
          if(bool.length !== 1)
            throw (`MALA SINTAXIS PARA UNA COMPARACION BOLLEANA: "${x}"`);
          
          ineq = [];
          bool.push(x);
          if(bool[0] && bool[1] == '||'){
            bool = [true];
            return false;
          }
          return true;
        }
        // verificando existencia de operadores de desigualdad
        else if((i % 4) - 1 === 0 && x){
          if(! this.#whereOption.inequal.hasOwnProperty(x)) 
            throw (`NO EXISTE LA DESIGUALDAD: "${x}"`);

          if(ineq.length !== 1)
            throw (`MALA SINTAXIS DE DESIGUALDAD "${x}"`);
          
          ineq.push(x);
          return true;
        }
        // verificando que los valores
        else{
          if(this.#whereOption.bollean.hasOwnProperty(x) || this.#whereOption.inequal.hasOwnProperty(x))
            throw (`NO EXISTE LA DESIGUALDAD: "${x}"`);          
          
          if(db.hasOwnProperty(String(x))) ineq.push(db[x]);
          else ineq.push(x);

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
        }
      })

      return bool[0];

    }catch(e){
      return callback(`[WHERE] ${e}`);
    }
  }
  /**
   * @param { [...string] } uniques 
   * @param { (err)=>{} } callback 
   * @returns 
   */
  #uniques(uniques, data, callback){
    try{
       let where = [];
      uniques.forEach((unique, i)=>{
        if(! data.hasOwnProperty(unique)) 
          throw `ERORR EL VALOR UNICO "${unique}" COMO PROPIEDAD DE LAS DATAS ENVIADASNO EXISTE`
        where.push(unique);
        where.push("==");
        where.push(data[unique]);
        if(uniques.length - 1 === i) return;
        where.push("&&");
      });

      let res = this.read(
        null,
        uniques,
        null,
        where,
        (err, resp)=>{
          if(err) throw(err);
          return resp;
        }
      )
      if(res.length)
        return true;
    }catch(e){
      callback(`[UNIQUE] ${e}`);
    }
  }
  /**
   * !==========================
   * !============= CREATE ==========
   * !==========================
   * La CREATE declaración se utiliza para insertar nuevos registros en una tabla.
   * @param { [...{}] } datas valor a insertar 
   * @example { name: Hanns, surname: Maza} se recomienda tener una funcion que retorne una plantilla
   * id del objeto, se agrega por defecto
   * @param { [...string]} uniques;
   * @param {(err: string, resp: [...{}])=>{}} callback 
   * @example la respuesta es verdadera si se inserto con exito
   */
  insert(datas, uniques, callback) {
    
    if(!callback) return;

    try{
      let db = this.#File.read();
      let typeData = db[0];

      //modificando el ingreso de data
      datas = datas.map((data)=>{

        if(Array.isArray(uniques) && uniques.length && this.#uniques(uniques, data, (e)=>{
          if(e) throw e;
        })) 
          throw "[INSERT] Valores unicos encontados";

        this.#typeRow(data, typeData, ((e, r)=>{
          //si existe error
          if(e) throw e;
          //reemplazando la data actual
          else data = {
            ...r
          }
        }));

        
        //destructurando la id ingresada de data
        let { id: not, ...rest } = data
        
        //ingresando id legitima para la db
        data = {
          id: db.length,
          ...rest
        }
        
        //agregando data a la db
        db.push(data);
        return data;
      })
      
      //regresando la data modificada, legitima a la db
      if(this.#File.write(db)) 
        return callback(null, datas);
    }catch(e){
      return callback(e);
    }
  }  
  /**
   * !==========================
   * !============= READ ==============
   * !==========================
   * La READ instrucción se utiliza para seleccionar datos de una base de datos.
   * Los datos devueltos se almacenan en una tabla de resultados, denominada conjunto de resultados.
   * @param { string } selectRows 
   * "*" todo las filas visible
   * "**" todo las filas visible y las eliminadas
   * "***" archivo real
   * @param {[...string]} selectColumn * todo, name, !name
   * @param { [...number] } ids 
   * @param {[...string]} where (==, !=, >=, <=, >, <)(&&, ||)
   * @example name == hanns && nick != iAmGod
   * @param {(err: string ,resp: object)=>{}} callback 
   */
  read (selectRows, selectColumn, ids, where, callback){
    //si no existe callback no es necesario devolver alguna respuesta
    if(!callback) 
      return;

    try{

      let RES = [];

      //pidiendo la db
      let dbArray = this.#File.read();

      /**
       * @param { {} } dbObject 
       * @param { number } index 
       * @returns 
       */
      let filterColumm = (dbObject)=>{
        //si el argumento es todo
        if(selectColumn.some(e=>e ==='*')) 
          return dbObject;

        let dataRow = {};
        let error = false;

        selectColumn.forEach((selectKey)=>{
          if(!selectKey) 
            throw ('UN PARAMETRO DEL SELECTRO DE COLUMNAS ESTA VACIO');
          let not = selectKey.includes('!')
            ? selectKey = selectKey.split('!').join('') 
            : null;
          if(!dbObject.hasOwnProperty(selectKey))
            throw (`NO EXISTE LA PROPIEDAD "${selectKey}" EN LA DATA DE LA TABLA "${this.#nameTable}"`);
          let { [selectKey] : name, ...notname } = dbObject;
          if(not) dbObject = notname;
          else dataRow[selectKey] = name;
        });
        return Object.keys(dataRow).length
          ? dataRow 
          : error
            ? [] 
            : dbObject;
      }

      // busqueda de filas id
      if(ids){
        if(Array.isArray(ids))
          ids.forEach((id)=>{
            if(! dbArray.hasOwnProperty(id))
              throw (`NO EXISTE LA IDENTIFICACION: "${id}"`);

            let resp = dbArray[id];

            resp = filterColumm(resp);

            RES = [
              ...RES,
              Array.isArray(resp)
                ? null
                : resp
            ];
          });
        else{
          if(! dbArray.hasOwnProperty(ids))
            throw (`NO EXISTE LA IDENTIFICACION: "${ids}"`);        
          let resp = dbArray[ids];

          resp = filterColumm(resp);

          RES = [
            ...RES,
            Array.isArray(resp)
              ? null
              : resp
          ];
        };
      }
      else{
        RES = [...dbArray];
        // si existe filtro de columnas
        if(selectRows === 'MIN'){
          RES = RES.find((dbObject, index)=>{
            if(index === 0)
              return false;
  
            // si la id no es un numero es por que fue eliminada(solo ocultada)
            if(!dbObject || typeof dbObject.id !== 'number')
              return false;
            
            // la data debe cunplir la condicion para editarla
            if(!this.#where(where, dbObject, (err)=>{
              if(err) throw err;
            }))
              return false;
            
            return true;
          })
          RES = RES && selectColumn
            ? [filterColumm(RES)]
            : [];
        }
        else if(selectRows === 'MAX'){
          RES = RES.reverse().find((dbObject, index, Arr)=>{
            if(Arr.length - index === 1)
              return false;
  
            // si la id no es un numero es por que fue eliminada(solo ocultada)
            if(!dbObject || typeof dbObject.id !== 'number')
              return false;
            
            // la data debe cunplir la condicion para editarla
            if(!this.#where(where, dbObject, (err)=>{
              if(err) throw err;
            }))
              return false;
            
            return true;
          })
          RES = RES && selectColumn
            ? [filterColumm(RES)]
            : [];
        }
        else{

          //si el argumento es todo absoluto, filtro de para todo sin restriccion
          let isIndex = !ids && selectRows !=='***';
  
          RES = RES.flatMap((dbObject, index, Arr)=>{
            if(index === 0 && isIndex)
              return [];
            
            if(dbObject === null){
              if(selectRows ==='**')
                return null
              return [];
            }
            
            // si la id no es un numero es por que fue eliminada(solo ocultada)
            if(typeof dbObject.id !== 'number'){
              if(dbObject.id === 'number')
                return dbObject;
              if(selectRows ==='*' || selectRows ==='**')
                return dbObject;
              return [];
            }
            
            // la data debe cunplir la condicion para editarla
            if(!this.#where(where, dbObject, (err)=>{
              if(err) throw err;
            }))
              return [];
            
            if(selectColumn)
              return filterColumm(dbObject, index, Arr);
          });
        }
      }

      
      return callback(null, RES);
      
    }catch(e){
      console.log(e);

      return callback(e, []);
    }
  }
  /**
   * !==========================
   * !============= UPDATE ==============
   * !==========================
   * @param {[...string]} select 
   * La UPDATE declaración se utiliza para modificar los registros existentes en una tabla.
   * @param { number } id
   * @param {[...string]} where (==, !=, >=, <=, >, <)(&&, ||)
   * @example name == hanns && nick != iAmGod
   * @param {[...string]} clear
   * @param {{}} set * todo, name, !name
   * @param {(err: string ,resp: boolean)=>{}} callback 
   */
  update (select, id, where, clear, set, callback){

    if(!callback) 
      return;

    try{
      let update = [];
      //llamando a la db
      let dbArray = this.#File.read();
      if(id){
        if(! dbArray.hasOwnProperty(id))
          throw (`NO EXISTE LA IDENTIFICACION: "${id}"`);
        let data = dbArray[id];
        let dbId = data.id;
        if(typeof set === 'object'){
          //actualizando solo con los valores de set
          if(select.join('').includes('*')) data = {
            ...data,
            ...set
          };
          //actualizando valores parcialmente
          else data = {
            id: data.id,
            ...set
          }
        }
        if(typeof clear === 'object'){
          if(!clear.length) return;
          clear.forEach((element)=>{
            let {[element]: dlt, ...rest} = data
            data = rest;
          })
        }
        data.id = dbId;
        dbArray[id] = data;
        update.push(data)
      }
      else
        //navegando la bd
        dbArray = dbArray.map((dbObject)=>{

          //se establece la variable error para evitar que se escriba en la db
          if(typeof dbObject.id !== 'number' || !this.#where(where, dbObject, (e)=>{
            if(e) throw e;
          })) 
            return dbObject;

          //guardando una copia de la id
          let dbId = dbObject.id;
          if(typeof set === 'object'){
            //actualizando solo con los valores de set
            if(select.join('').includes('*')) dbObject = {
              ...dbObject,
              ...set
            };
            //actualizando valores parcialmente
            else dbObject = {
              id: dbObject.id,
              ...set
            }
          }
          if(typeof clear === 'object'){
            if(!clear.length) return;
            clear.forEach((element)=>{
              let {[element]: dlt, ...rest} = dbObject
              dbObject = rest;
            })
          }

          dbObject.id = dbId;

          update.push(dbObject);

          return dbObject;
        });
      if(this.#File.write(dbArray)) 
        return callback(null, update);
    }catch(e){
      return callback(e);
    }
  }
  /**
   * !==========================
   * !============= DELETE ==============
   * !==========================
   * La DELETE instrucción se utiliza para eliminar registros existentes en una tabla.
   * @param {string} where (==, !=, >=, <=, >, <)(&&, ||)
   * @example name == hanns && nick != iAmGod
   * @param {boolean} definitive
   * @param {(resp: boolean)=>{}} callback 
   */
  delete(id, where, definitive, callback){

    if(!callback) return;

    try{
      let dlt = [];
      //llamando a la db
      let dbArray = this.#File.read();

      if(id){
        if(! dbArray.hasOwnProperty(id))
          throw (`NO EXISTE LA IDENTIFICACION: "${id}"`);
        let data = dbArray[id];
        if(!data)
          throw (`LA DATA YA FUE ELIMINADA DEFINITIVAMENTE`);

        if(definitive)
          dbArray[id] = null;
        else if(Array.isArray(data.id))
          throw (`LA DATA YA FUE ELIMINADA PERO NO DEFINITIVAMENTE`);
        else
          dbArray[id].id = [data.id];
        
      }
      else
        //navegando la bd
        dbArray = dbArray.flatMap((dbObject)=>{
          if(!dbObject || typeof dbObject.id !== 'number' || !this.#where(where, dbObject, (e)=>{
            if(e) throw e;
          })) 
            return dbObject;

          dlt.push({
            ...dbObject
          });
          if(!definitive) dbObject.id = [dbObject.id];

          return definitive
            ? null
            : dbObject;
        })

      if(this.#File.write(dbArray)) 
        return callback(null, dlt);
    }catch(e){
      return callback(e);
    }
  }
}

module.exports = DataCrud;