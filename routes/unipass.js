var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');


/* GET users listing. */
router.get('/', function(req, res, next) {

    let dateNum = 8;
    switch (req.query.date) {
        case "3M":
            dateNum = 8;
            break;
        case "1M":
            dateNum = 7;
            break;
        case "1W":
            dateNum = 6;
            break;
        case "1D":
            dateNum = 5;
            break;
        default:
            dateNum = 8;
    }

    console.log("date is "+dateNum);

    return (async () => {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setViewport({ width: 1866, height: 768,isMobile: false});
        await page.goto('http://in-test.unipassghana.com/login/login.do');

        await page.click("#userid");
        await page.keyboard.type("CSAFLAO1");

        await page.click("#userpw");
        await page.keyboard.type("!Aa12345678");

        await page.click("#form1 > fieldset:nth-child(2) > button");

        await page.waitForNavigation();

        await page.screenshot({path: "unipass1.png"});

        await page.waitForSelector("#nav__group > ul > li:nth-child(2) > ul > li:nth-child(2)");

        await page.click("#nav__group > ul > li:nth-child(2) > a");

        //
        await page.click("#nav__group > ul > li:nth-child(2) > ul > li:nth-child(2)");

        await page.waitForSelector("body > main > aside > div.side-menu.side__taskmenu.active > ul > li:nth-child(1) > a");


        await page.screenshot({path: "unipass2.png"});


        await page.click("body > main > aside > div.side-menu.side__taskmenu.active > ul > li:nth-child(1) > a");


        await page.click("#CLM03S01V14");


        await page.waitForSelector("#searchForm > table > tbody > tr:nth-child(1) > td:nth-child(2) > button:nth-child(8)");

        await page.click(`#searchForm > table > tbody > tr:nth-child(1) > td:nth-child(2) > button:nth-child(${dateNum})`);

        await page.click("#searchForm > div > div.button_right_area > button.g-button.search");

        await page.waitForSelector("#contents > div > table");


        await page.screenshot({path: "unipass3.png"});

        let data = await page.evaluate(() => {
            var arr = [];

            document.querySelectorAll("#contents > div > table > tbody > tr").forEach( (ele) =>  {
                let d = {
                    "boe_no": ele.querySelector("td:nth-child(1)").innerText,
                    "date": ele.querySelector("td:nth-child(2)").innerText,
                    "Suspension Reason": ele.querySelector("td:nth-child(3)").innerText,
                    "Suspension Remarks": ele.querySelector("td:nth-child(4)").innerText,
                    "Suspension Date": ele.querySelector("td:nth-child(5)").innerText,
                    "Suspension Officer": ele.querySelector("td:nth-child(6)").innerText,
                    "Cancellation Date": ele.querySelector("td:nth-child(7)").innerText,
                    "Cancellation Officer": ele.querySelector("td:nth-child(8)").innerText,
                };
                arr.push(d);
            });
            return arr;
        });

        console.log(data);

        await browser.close();

        return data

    })().then(d => {

        return res.status(200).json({
            "error":false,
            "data": d
        })

    }).catch(err => {
        return res.status(500).json({
            "error": true,
            "message": err
        })
    });



});

module.exports = router;
