var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Orders', captureOrderService: "//"+process.env.CAPTUREORDERSERVICEIP+"/v1/order" });
});

module.exports = router;
