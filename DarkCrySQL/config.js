/*
  !no eliminar las propiedades.
*/
/**
 * @type {{
 *  LOGIN: {
 *    URL: string,
 *    HOST: string,
 *    PORT: number,
 *    PASS: string
 *  },
 *  QUERY: {
 *    ENQUEUE: boolean,
 *    VIEWS: boolean,
 *    DIRDATABASE: string,
 *    SPACE: 0 | 1 | 2 | 3 | 4,
 *    ENCRYP: boolean,
 *    SECRET: string,
 *  },
 *  LOGGER:{
 *    STATUS: boolean,
 *    DIRLOGGER: string,
 *    GMT: number,
 *  },
 * }}
 */
module.exports = {
  LOGIN: {
    // !require: hosting de session http 
    HOST: "http://localhost",

    // !require: puerto de sesion http
    PORT: 3000,

    // !require: contraseña de sesion
    // ? https://www.lastpass.com/es/features/password-generator 
    PASS: "%1HkhyQdaMSQE6f&bAMptlf*tCIC4u*CZVpc53%dO1r6UrpT&U",

    // *opcional: el constructor formara el url
    URL: null,
  },
  QUERY: {
    // *opcional: enlista las peticion a la DB
    ENQUEUE: false,

    // *opcional: enciende el visualizador web
    VIEWS: true,

    // *opcional: directorio donde se guardaran las tablas
    DIRDATABASE: null,

    // *opcional: numero de espacios en la tabulacion de los archivos json
    SPACE: 2,

    /* 
    ! ·la contraseña de encriptacion es requerida si el estado encriptacion es <true>.
    ? En el caso querer desactivar la encriptacion(1·) ó de cambio de contraseña de encriptacion(1·,2·)
    ! 1·Establecer el estado de encriptacion en <false> mantener la contraseña actual, 
    !  Reiniciar el sistema para que se desencripten las tablas.
    ! 2·Por ultimo cambiar la contraseña y establecer el estado en <true>
    */
    // *opcional: estado de encriptacion
    ENCRYP: false,

    // *opcional: contraseña de encriptacion,
    // ? https://www.lastpass.com/es/features/password-generator
    SECRET: "%1HkhyQdaM",
  },
  LOGGER: {
    // *opcional: <false> no guarda registros, true si
    STATUS: false,

    // *opcional: directorio donde se guardaran los registros 
    DIRLOGGER: null,

    // *opcional: diferencia horaria respecto al meridiano de greenwich
    GMT: -5,
  },
}