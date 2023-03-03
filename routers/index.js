const express = require('express')
const router = express.Router()
router.use('/user',require('./user'))
router.use('/swiper',require('./swiper'))
router.use('/navgator',require('./navgator'))
module.exports = router