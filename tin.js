const puppeteer = require('puppeteer');

exports.Tin = class {

    async verifyTin (tin) {
        return (async () => {
            const browser = await puppeteer.launch({headless: false });
            const page = await browser.newPage();
            await page.setViewport({width: 1866, height: 768, isMobile: false});
            await page.goto('https://rapps.gegov.gov.gh/tripsutil/tinsearch.jsp');


            await page.click("#taxpayertin");
            await page.keyboard.type(tin);

            await page.keyboard.press("Enter");

            // let selector = "#searchresp";

            await page.waitForFunction( () => document.querySelector("#searchresp").childElementCount > 0);


            let len  = await page.evaluate( () => {
                return document.querySelector("#searchresp").childElementCount
            });

            if (len < 2) {
                return  "not found";
            }


            await page.waitForSelector("#resultshdr");

            let data = await page.evaluate(() => {
                let arr = [];
                document.querySelectorAll(".resultslbl").forEach((ele) => {
                    arr.push(ele.innerHTML.replace("<b>","").replace("</b>",""));
                });
                return arr;
            });

            console.log(data);

            let tradingAs = await page.evaluate(() => {
                if (document.querySelector("#tradinglist") == null) {
                    return;
                }
                return document.querySelector("#tradinglist").innerText.split("\n");
            });

            data["trading"] =

            await page.screenshot({path: "aa.png"});

            browser.close();

            return data;


        })();
    }

};

