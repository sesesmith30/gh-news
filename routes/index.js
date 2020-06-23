var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const joyOnline = require("../sources/myjoyonline");
const ghanaweb  = require("../sources/ghanaweb");
const modernGhana = require("../sources/modernghana");
const ghPage = require("../sources/ghpage");
const yen = require("../sources/yen");
const tin  = require("../tin");


/* GET home page. */
router.get('/a', function(req, res, next) {
});

router.get("/myjoyonline", (req,res) => {
    (async () =>{
        let news  = await new joyOnline.MyJoyOnline().getNews();
        res.send(news);
    })();
});

router.get("/verifyTin",(req,res) => {
    (async () =>{
        let news  = await new tin.Tin().verifyTin(req.query.tin);
        res.send(news);
    })();
});

router.get("/ghpage", (req,res) => {
    (async () =>{
        let news  = await new ghPage.GhPage().getNews();
        res.send(news);
    })();
});


router.get("/modernghana", (req,res) => {
    (async () =>{
        let news  = await new modernGhana.ModernGhana().getNews();
        res.send(news);
    })();
});

router.get("/ghanaweb", (req,res) => {
    (async () =>{
        let news  = await new ghanaweb.GhanaWeb().getNews();
        res.send(news);
    })();
});

router.get("/yen", (req, res) => {
    (async () => {
        let news  = await new yen.yen().getNews();
        res.send(news);
    })();
});



module.exports = router;
