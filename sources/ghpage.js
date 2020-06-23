const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


exports.GhPage = class {

    constructor() {
        this.knex = require('knex')({
            client: 'mysql',
            connection: {
                socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
                user : 'root',
                password : 'root',
                database : 'news'
            }
        });
    }

    async getNews () {

        return (async () => {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.goto('https://www.ghpage.com',{
                waitUntil: 'domcontentloaded',
                timeout: 0
            });

            let data = await page.evaluate(() => {
                let arr = [];
                document.querySelectorAll(".td-mc1-wrap > div").forEach((ele) => {
                    arr.push(ele.innerHTML);
                });
                return arr;
            });

            console.log("am here");

            var newsArr = [];
            var count = 0;

            for(const html of data) {

                const $ = cheerio.load(html);

                let title = $("div > div.td-module-meta-info > h3").text();
                let arthur = $("div > div.td-module-meta-info > div.td-editor-date > span > span.td-post-author-name > a").text();
                let date = $("div > div.td-module-meta-info > div.td-editor-date > span > span.td-post-date > time").attr("datetime");
                let category = $("div > div.td-image-container > a").text();
                let link = $("div > div.td-image-container > div > a").attr("href");
                let imageStr = $("div > div.td-image-container > div > a > span").attr("style");

                let image = imageStr.match(/background-image: url\([\S]{1,500}\)/gi)[0].replace("background-image:","").trim().substring(4);
                image = image.substring(0,image.length-1);




                let details = await this.getNewsDetails(page,link,count);

                let n = {"source": "ghpage","title": title, "image_url": image, "url": link, "content": details.content};

                newsArr.push(n);

                this.knex("news").insert(n).then((res) => {
                    console.log("news pushed successfully");
                }).catch((err) => {
                    console.log("Error is :"+err);
                });

                count = count + 1;

            }

            await browser.close();

            return newsArr;

        })();
    }

    async getNewsDetails(page,url,count) {

        await page.goto(url,{
            waitUntil: 'domcontentloaded',
            timeout: 0
        });

        let data = await page.evaluate(() => {
            let contentArr = [];
            let imageCaption = document.querySelector("figcaption") !== null ? document.querySelector("figcaption").innerText :  "";

            document.querySelectorAll(".td-post-content > div > p").forEach((ele) => {
                contentArr.push(ele.innerHTML);
            });

            return {"image_caption": imageCaption,"content" : contentArr.join("<br><br>")};

        });

        await page.screenshot({path: count+".png"});

        return data;

    }



};