const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


exports.MyJoyOnline = class {

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

    async getNews() {

        return (async () => {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.goto('https://www.myjoyonline.com/category/news/national/',{
                waitUntil: 'domcontentloaded',
                timeout: 0
            });

            let data  = await page.evaluate(() => {
                var arr = [];
                document.querySelectorAll("div.mjo-body > div.container > div > div.col-sm-12.col-md-12.col-lg-9.mt-lg-3.mt-sm-3.mt-md-3 > div.row > div").forEach((ele) => {
                    arr.push(ele.innerHTML);
                });
                return arr;
            });

            var newsArr = [];
            var count = 0;
            let link;
            for (const html of data) {

                const $ = cheerio.load(html);

                var linkNode = $("div > div > a");

                if (linkNode === undefined || linkNode === null) {
                    console.log("error");
                }else {
                    link = linkNode.attr("href");
                    let title = $("div > div.home-section-story-list > a > h4").text();
                    let image = $("div > div > a").attr("style");
                    let details = await this.getNewsDetails(page, link, count);

                    let n = {"source": "myjoyonline","title": title, "image_url": image, "url": link, "content": details.content};

                    this.knex("news").insert(n).then(res => {
                        console.log("news pushed successfully");
                    }).catch(err => {
                        console.error("error is "+err);
                    });

                    newsArr.push(n);
                    count++;
                }


            }

            await browser.close();

            return newsArr;
        })();


    }

    async getNewsDetails(page,url,count) {

        if (url === undefined) {
            return {"content": ""};
        }

        await page.goto(url,{
            waitUntil: 'domcontentloaded',
            timeout: 0
        });

        let data = page.evaluate(() => {

            var arr = [];
            document.querySelectorAll("#article-text > p").forEach((para) => {
                arr.push(para.innerHTML);
            });

            return {"content": arr.join("<br><br>")};

        });
        await page.screenshot({path: count+".png"});

        return data;


    }



};
