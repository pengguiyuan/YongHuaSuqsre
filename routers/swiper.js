const express = require('express')
const router = express.Router()
const pool = require('../model/index')
const mysql = require('../model/orm')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const moment = require('moment')
let date = new Date()
let time = date.getTime()
let originalname;
let random = Math.floor(Math.random() * (1000 - 100 + 1)) + 100
let urlStr; 
let obj;
let arr = [];
let swi_url = ''
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'routers/upload'); 
    },
    filename: function(req, file, cb) {
        originalname = Buffer.from(file.originalname, "latin1").toString("utf8"); // 解决接收文件的文件名中文乱码问题
        urlStr = time + '-' + random + '-' + originalname
        time = date.getTime()
        random = Math.floor(Math.random() * (10000 - 100 + 1)) + 100
        swi_url = 'http://localhost:3000/' + urlStr
        obj = {
            swi_url,
            swi_qiyong:'false',
            swi_type:"家具",
            swi_time:moment(new Date()).format()
        }
        arr.push(obj)
        cb(null, urlStr)
    }
})
let upload = multer({ storage: storage });
// wx小程序 ： 查询为启用状态的轮播图数据
router.get('/',(req,res) => {
    try {
        const swiper = mysql.model('swiper')
        swiper.find('swi_qiyong="true"',(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            res.send({code:200,msg:"请求成功，你很棒",data:data})
        })
    } catch(err) {
        console.log(err);
        res.send(err)
    }
})
// PC管理端 ： 查询不同字段数据的总和
router.get('/:name',(req,res) => {
    try {
        let name = req.params.name
        console.log('name',name);
        let swiper = mysql.model('swiper')
        swiper.sql(`select count(*) as sum from swiper where ${name}='true'`,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            console.log('data----',data);
            let sum = data[0].sum
            res.send({code:200,msg:"数据查询成功，你很棒",sum})
        })
    } catch (err) {
        console.log(err);
        res.send(send)
    }
})
// PC管理端 ： 查询轮播数据（包含分页、数据总数） 
router.get('/:number/:count',(req,res) => {
    try{
        let swiper = mysql.model('swiper')
        let number = req.params.number
        let count = req.params.count
        let sum;
        swiper.sql('select count(*) as sum from swiper',(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            sum = data[0].sum
        })
        swiper.limit({number,count},(err,data) => {
            if(err) {
                res.send(err)
                console.log(err);
                return 
            }
            res.send({code:200,msg:"数据查询成功！",sum,data})
        })
    } catch (err) {
        console.log(err);
    }
})
// PC管理端 ： swiper数据增加  
router.post('/odd',upload.array('avatar',3),(req,res) => {
    try {
        if(req.file) {
            pool.getConnection(function(err, connection) {
                if (err) console.log(err);
                connection.query('insert into swiper values(0,?,?,?,?)',Object.values(arr[0]), function (error, results, fields) {
                    console.log('results',results);
                    connection.release();
                  if (error) console.log(error);;
                });
            })
            arr = []
        } else if(req.files) {
            arr.forEach(val => {
                pool.getConnection(function(err, connection) {
                    if (err) console.log(err); 
                    // Object.values(obj)将obj中所有可枚举属性的值组成一个数组
                    connection.query('insert into swiper values(0,?,?,?,?)',Object.values(val), function (error, results, fields) {
                        console.log('results',results);
                        connection.release();
                      if (error) console.log(error);;
                    });
                })
            })
            arr = []
        } else {
            res.status(400).send(JSON.stringify({success: '服务器未接收到传递的数据或数据、格式错误'}))
        }
        res.send({code:200,msg:"成功"})
    } catch (err) {
        if (err instanceof multer.MulterError) {
        console.log(err.code);
        } else {
        console.log(err);
        }
        res.status(500).send(err);
    }
})
// PC管理端 ： 删除
router.delete('/:id',(req,res) => {
    try {
        const index = req.body.url.indexOf('1')
        const url = req.body.url.substring(index)
        const swiper = mysql.model('swiper')
        swiper.delete(`id=${req.params.id}`,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            fs.unlink(path.join(__dirname,`upload/${url}`),(err) => {
                console.log('删除图片报错',err);
                console.log(path.join(__dirname,`img/${url}`));
            })
            res.send({code:200,msg:"数据删除成功，你很棒!"})
        })
    } catch(err) {
        console.log(err);
        res.send(err)
    }
})
// PC管理端 ： 修改数据
router.put('/:id',(req,res) => {
    try {
        console.log('put----请求',req.body);
        let swiper = mysql.model('swiper')
        let id = req.body.id
        let obj = {
            swi_url: req.body.swi_url,
            swi_type: req.body.swi_type,
            swi_qiyong: req.body.swi_qiyong,
            swi_time: req.body.swi_time
        }
        swiper.update(`id=${id}`,obj,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            res.send({code:200,msg:'数据修改成功！'})
        })
    } catch (err) {
        console.log(err);
        res.send(err)
    }
})
module.exports = router