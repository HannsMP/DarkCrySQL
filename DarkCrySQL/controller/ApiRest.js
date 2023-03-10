const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { join, resolve } = require('path');
const { existsSync, readdirSync } = require('fs');
const http = require('http')
const { Server } = require("socket.io");

const ColorHex = require('../helper/ColorsHex');

class ApiRest {
  #Arg;
  #Database;
  #Logger;
  #ColorsHex;
  /**
   * @param { [...string] } users 
   * @param { {
   *   config:{
   *     logHistorial: boolean,
   *     asyncQuequ: boolean,
   *     encryp: boolean,
   *     view: boolean
   *     dirDatabase: string,
   *     dirlogger: string,
   *     hostDb: string, 
   *     space: number,
   *     utc: number,
   *   },
   *   login: {
   *     host: string,
   *     port: string | number,
   *     pass: string
   *   },
   *   tables:{
   *     nameTable: {
   *       nameColumms: "string" | "number" | "boolean" | "any" | "null"
   *     } | [...columms]
   *   } | [...string]  
   * } } Arg 
   * @param { import('../class/Query') } Database 
   * @param { import('../func/Logger')} Logger 
   */
  constructor(users, Arg, Database, Logger){
    this.#Arg = Arg;
    this.#Database = Database;
    this.#Logger = Logger;

    this.#ColorsHex = new ColorHex();

    //aplicativo express
    const app = express();
    const server = http.createServer(app);
    // respuesta en formato Json
    app.use(express.urlencoded({
      extended:false,
    }));
    app.use(express.json());
    
    //views of rutes from database json
    if(this.#Arg.config.view){
      if(existsSync(this.#Arg.config.dirDatabase)){
    
        const io = new Server(server);

        //recursos
        app.use(express.static(join(__dirname, '..', 'public')));

        //motor de plantilla
        app.set('view engine','ejs');

        //expressLayouts
        app.use(expressLayouts);
        app.set('layout', join(__dirname, '..', 'views', 'layout.ejs'));

        //variables de session
        app.use(session({
          secret:'secret',
          resave:true,
          saveUninitialized:true
        }));

        //lgin
        app.get('/login', (require('../routes/app/login.js')).bind(null, {
          Arg: this.#Arg ,
          Users: users
        }));
        //autentificacion
        app.post('/auth', (require('../routes/app/auth.js')).bind(null, {
          users: users,
          ...this.#Arg,
        }));
        //dashboard de tablas
        app.get('/', (require('../routes/app/index.js')).bind(null, {
          Arg : this.#Arg,
          database: this.#Database,
          ColorHex : this.#ColorsHex
        }));
        //visor de tablas
        app.get('/tablas/:fileName', (require('../routes/app/tables.js')).bind(null, {
          Arg : this.#Arg,
          database: this.#Database
        }));
        //cerrando sesion del usuario
        app.get('/logout', (require('../routes/app/logout.js')).bind(null, {}));
        this.#Logger.log({
          type: 'Proceso DarkRest',
          DarkRest: `[DarkRest]: (Activado) Dashboard, \u001b[34m "${this.#Arg.login.url}" \u001b[38m.`
        }, 'brightGreen', 'DarkRest');

        /* WEB SOCKET */
        io.on('connection', (socket) => {
          /* Elimnar tabla */
          socket.on('eliminarTabla', (nameTable)=>{
            if( !nameTable) 
              return;

            this.#Database
              .deleteTable(nameTable)
              .end((err, resp)=>{
                io.emit('respElimnarTabla', err, resp, nameTable);
              })
          });
          /* Agregar Tabla */
          socket.on('agregarTabla', (nameTable)=>{
            if( !nameTable) 
              return;
            this.#Database
              .createTable(nameTable)
              .end((err, resp)=>{
                io.emit('respAgregarTabla', err, resp, nameTable, this.#ColorsHex);
              })
          });
          /* Eliminar fila */
          socket.on('eliminarFila', (table, id)=>{
            if(!table || !id)
              return;
            this.#Database
              .delete(table, true)
              .id(id)
              .end((err, resp)=>{
                io.emit('respEliminarFila', err, resp, id);
              })
          })
          /* Abrir Editor de Fila */
          socket.on('abrirEditorFila', (table, id)=>{
            if(!table || !id)
              return;
            this.#Database
              .getyng(table)
              .select('*')
              .id(id)
              .end((err, resp)=>{
                io.emit('respAbrirEditorFila', err, resp, id);
              })
          })
          /* Editar Fila */
          socket.on('editarFila', (table, id)=>{
            
          })
          /* Agregar Fila */
          socket.on('agregarFila', (table, id)=>{

          })
        })
      }
      else{
        app.use( '/css', express.static(join(__dirname, '..', 'public', 'css')));

        app.get('/', (req, res)=>res.render(join(__dirname, '..', 'views', 'helper', 'emptyTable.ejs')));
      }
    }
    else{
      app.use('/css', express.static(join(__dirname, '..', 'public', 'css')));

      app.get('/', (req, res)=>res.render(join(__dirname, '..', 'views', 'helper', 'notViews.ejs')));
    };
    
    //api-rest
    let dirApi = resolve(__dirname, '../routes/api');
    this.#Arg.login.users = users;
    readdirSync(dirApi).forEach((fileName)=>{
      app.post(`/api/${fileName.split('.')[0]}`,(require(join(dirApi, fileName))).bind(null,{
        arg: this.#Arg,
        database: this.#Database,
        logger: this.#Logger
      }));
    })

    server.listen(Number(this.#Arg.login.port), (err)=>{
      if(err) return console.error(err);
      else{
        this.#Logger.log({
          type: 'Proceso DarkRest',
          DarkRest: `[DarkRest]: (Activado) ApiRest, \u001b[34m "${this.#Arg.login.url}" \u001b[38m.`
        }, 'brightGreen', 'DarkRest');
      }
    });
  }
  #delay = (time)=>{
    return new Promise((res)=>{
      setTimeout(()=>{
        res()
      }, time)
    })
  };
  async #client(host, log){
    let url = new URL(host);
    if(log)
    superagent
      .post(host)
      .send({})
      .end(()=>{

      });
  }
  /**
   * @param { URL } host 
   * para proyectos https://replit.com/
   * URL sera el host que entregue la pagina
   * esto permitira que el propio robot automantenga otros host
   * @param { number } time 
   */
  async upTimeRobot(host, time, log) {
    if(typeof host !== 'string' || typeof time !== 'number')
      return;
    while(true){
      this.#client(host, log)
      await this.#delay(time)
    }
  }
  /**
   * @param { URL } host 
   * para proyectos https://replit.com/
   * URL sera el host que entregue la pagina
   * esto permitira que el propio robot se automantenga
   */
  on(){
    this.upTimeRobot(this.#Arg.login.host, 6000, false)
  }
}

module.exports = ApiRest;