const mysql = require('mysql');
// 数据库连接设置
let pool = mysql.createPool({
    connectionLimit : 10,
    host: 'localhost',//数据库地址
    port:'3306',
    user: 'root',//用户名，没有可不填
    password: '123456',//密码，没有可不填
    database: 'yonghuasuqare'//数据库名称
})

module.exports = pool
  