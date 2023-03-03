const express = require('express')
const bodyParse = require('body-parser')
const app = express()
const cors = require('cors')
const config = require('./config/index.js')
const morgan = require('morgan')
const path = require('path')
const bodyParser = require('body-parser')
// 处理中间件
// 处理json格式数据
// app.use(express.json()) 
// 将body-parser功能添加到项目app中
app.use(bodyParser.urlencoded({extended:false}))
// 解析数据
app.use(bodyParser.json())
// 处理跨域
app.use(cors()) 
// 处理日志，可以知道请求错误在哪，不至于请求错误，服务器没啥提示
app.use(morgan("dev")) 
// 静态资源托管
app.use(express.static('./routers/upload'))
app.use(express.static('./routers/img'))
// 载入路由中间件
app.use('/api',require('./routers/index'))
app.use(bodyParse.urlencoded({extended:false})) // false代表接收的值为字符串或者数组，true代表接收任意值类型的数据
app.listen(config.app.port,() => {
    console.log('YongHuaSuqare---NodeJs以启动');
})