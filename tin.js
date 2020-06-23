const puppeteer = require('puppeteer');

exports.Tin = class {

    async verifyTin (tin) {
        return (async () => {
            const browser = await puppeteer.launch({headless: true,args: ['--no-sandbox']});
            const page = await browser.newPage();
            await page.setViewport({width: 1866, height: 768, isMobile: false});
            await page.goto('https://rapps.gegov.gov.gh/tripsutil/tinsearch.jsp');


            await page.click("#taxpayertin");
            await page.keyboard.type(tin);

            await page.keyboard.press("Enter");

            await page.waitForFunction( () => document.querySelector("#searchresp").childElementCount > 0);


            let len  = await page.evaluate( () => {
                return document.querySelector("#searchresp").childElementCount
            });

            if (len < 2) {
                return  {
                    "error": true,
                    "message": "TIN not found"
                };
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
                if (document.querySelector("#tradinglist") == null || document.querySelector("#tradinglist").innerText == "") {
                    return [];
                }
            });

            await page.screenshot({path: Date.now()+".png"});

            browser.close();

            return {
                "TINNumber": data[1].replace("TIN: ",""),
                "Organisation":data[2].replace("Name: ",""),
                "Status": data[3].replace("Status: ",""),
                "TradingAs": tradingAs
            };


        })();
    }

};

