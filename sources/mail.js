
var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

router.get('/', function(req, res, next) {


    (async () => {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setViewport({width: 1866, height: 768, isMobile: false});
        await page.goto('http://mail.yahoo.com/');


        await page.click("#login-username");
        await page.keyboard.type("wsloopfaq@yahoo.com");

        await page.click("#login-signin");

        await page.screenshot({path: "mail1.png"});

        await page.waitForNavigation();

        await page.screenshot({path: "mail2.png"});


        await page.click("#login-passwd");
        await page.keyboard.type("AJs2t178NCMMT2KKN5FtswV0KRlksmQY9B_tUXyjil19wLn7NA--");

        await page.screenshot({path: "mail3.png"});

        await page.click("#login-signin");






    })();

});


wsloopfaq@yahoo.com

AJs2t178NCMMT2KKN5FtswV0KRlksmQY9B_tUXyjil19wLn7NA--