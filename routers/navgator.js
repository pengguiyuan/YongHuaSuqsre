const express = require('express')
const router = express.Router()
const multer = require('multer')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const pool = require('../model/index')
const mysql = require('../model/orm')
let date = new Date()
let time = date.getTime()
let originalname;
let random = Math.floor(Math.random() * (1000 - 100 + 1)) + 100
let urlStr; 
let obj;
let arr = [];
let nav_src = ''
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'routers/img'); 
    },
    filename: function(req, file, cb) {
        originalname = Buffer.from(file.originalname, "latin1").toString("utf8"); // 解决接收文件的文件名中文乱码问题
        urlStr = time + '-' + random + '-' + originalname
        time = date.getTime()
        random = Math.floor(Math.random() * (10000 - 100 + 1)) + 100
        nav_src = 'http://localhost:3000/' + urlStr
        obj = {
            nav_name:'满额送礼',
            nav_url:"../../pages/search/index",
            nav_type:"家具",
            nav_src,
            nav_time:moment(new Date()).format(),
            nav_qiyong:'false'
        }
        arr.push(obj)
        cb(null, urlStr)
    }
})
let upload = multer({ storage: storage });
// 增加数据   上传图片
router.post('/',upload.array('avatar',3),(req,res) => {
    try {
        if(req.file) {
            pool.getConnection(function(err, connection) {
                if (err) console.log(err);
                connection.query('insert into navgatortype values(0,?,?,?,?,?,?)',Object.values(arr[0]), function (error, results, fields) {
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
                    connection.query('insert into navgatortype values(0,?,?,?,?,?,?)',Object.values(val), function (error, results, fields) {
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
        console.log(err);
        res.send(err)
    }
})
// 查询首页功能图数据
router.get('/:number/:count',(req,res) => {
    try{
        let navgatortype = mysql.model('navgatortype')
        let number = req.params.number
        let count = req.params.count
        let sum;
        navgatortype.sql('select count(*) as sum from navgatortype',(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            sum = data[0].sum
        })
        navgatortype.limit({number,count},(err,data) => {
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
// PC管理端 ： 修改数据
router.put('/:id',(req,res) => {
    try {
        console.log('put----请求',req.body);
        let navgatortype = mysql.model('navgatortype')
        let id = req.body.id
        let obj = {
            nav_name:req.body.nav_name,
            nav_url: req.body.nav_url,
            nav_type: req.body.nav_type,
            nav_src:req.body.nav_src,
            nav_time: req.body.nav_time,
            nav_qiyong: req.body.nav_qiyong
        }
        navgatortype.update(`id=${id}`,obj,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            res.send({code:200,msg:'数据修改成功！',data})
        })
    } catch (err) {
        console.log(err);
        res.send(err)
    }
})
// PC管理端 ： 查询不同字段数据的总和
router.get('/:name',(req,res) => {
    try {
        let name = req.params.name
        console.log('name',name);
        let navgatortype = mysql.model('navgatortype')
        navgatortype.sql(`select count(*) as sum from navgatortype where ${name}='true'`,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            console.log('data----',data);
            let sum = data[0].sum
            res.send({code:200,msg:"不同字段数据的总和数据查询成功，你很棒",sum})
        })
    } catch (err) {
        console.log(err);
        res.send(send)
    }
})
// PC管理端 ： 删除
router.delete('/:id',(req,res) => {
    try {
        const index = req.body.url.indexOf('1')
        const url = req.body.url.substring(index)
        const navgatortype = mysql.model('navgatortype')
        navgatortype.delete(`id=${req.params.id}`,(err,data) => {
            if(err) {
                console.log(err);
                res.send(err)
                return
            }
            fs.unlink(path.join(__dirname,`img/${url}`),(err) => {
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
module.exports = router