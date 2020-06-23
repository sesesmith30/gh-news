const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


exports.ModernGhana = class {

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
            await page.goto('https://www.modernghana.com/latest/1/1/1',{
                waitUntil: 'domcontentloaded',
                timeout: 0
            });

            let data = await page.evaluate( () => {
                var arr = [];
                document.querySelectorAll(".main-high-light > div.row > div").forEach((ele) => {
                    arr.push(ele.innerHTML);
                });
                return arr;
            });

            var newsArr = [];
            var count = 0;

            for (const html of data) {

                const $ = cheerio.load(html);

                let image = $("div > div > a > img").attr("src");
                let time = $("div.news-small-content > small").text();
                let link = $("div.news-title-rht > h3 > a").attr("href");

                let details = await this.getNewsDetails(page,link,count);

                let n = {"source": "modernghana","title": details.title, "image_url": image, "url": link, "content": details.content};
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

        })()

    }

    async getNewsDetails (page,url,count) {
        await page.goto("https://www.modernghana.com"+url,{
            waitUntil: 'domcontentloaded',
            timeout: 0
        });

        let data = await page.evaluate(() => {
            let title = document.querySelector(".article-pagin > div > div > h1").innerText;
            let contentArr = [];

            document.querySelectorAll("#article-123 > p").forEach((ele) => {
                contentArr.push(ele.innerHTML);
            });

            return {"title": title,"content" : contentArr.join("<br><br>")};

        });

        await page.screenshot({path: count+".png"});

        return data;

    }
};
