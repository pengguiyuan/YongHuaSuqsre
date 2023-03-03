const express = require('express')
const router = express.Router()
const mysql = require('../model/index')
// 获取所有用户
router.get('/',async(req,res) => {
    res.send('获取所有用户')
    console.log(mysql);
    const data = await mysql.getMysqlData(res,'user','find')
    console.log(data);
})
// 获取指定用户
router.get('/:id',(req,res) => {
    res.send('获取指定用户')
})
// 注册用户
router.post('/',(req,res) => {
    res.send('注册用户')
})
// 编辑修改指定用户
router.put('/:id',(req,res) => {
    res.send('编辑修改指定用户')
})
// 删除指定用户
router.delete('/:id',(req,res) => {
    res.send('删除指定用户')
})

module.exports = router