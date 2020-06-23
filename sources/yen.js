const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


exports.yen = class {

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
            await page.goto('https://yen.com.gh/latest/',{
                waitUntil: 'domcontentloaded',
                timeout: 0
            });

            let data = await page.evaluate(() => {
                var arr = [];
                document.querySelectorAll(".l-taxonomy-page-hero div > article").forEach((ele) => {
                    arr.push(ele.innerHTML);
                });
                return arr;
            });

            var count = 0;
            var newsArr = [];

            console.log("arr is "+data.length);

            for (const html of data) {

                let $ = cheerio.load(html);

                let image = $("a > picture > img").attr("src");

                if (image === undefined) {
                    image = $("a > picture > img").attr("data-src");
                }

                image = image.split("?")[0];

                let link = $("a").attr("href");

                let details = await this.getNewsDetails(page,link,count);

                let n = ({"source": "yen","title" : details.title,"image_url": image, "url": link,"content": details.content});
                // console.log(n);
                this.knex("news").insert(n).then((res) => {
                    console.log("news inserted successfully");
                }).catch(err => {
                   console.log("err is "+err);
                });
                newsArr.push(n);



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

            let title = document.querySelector("div.l-article__desktop-left > h1").innerText;
            let time = document.querySelector("div.c-article-info.c-article__info.l-extra-padding > time").getAttribute("datetime");
            let author = document.querySelector("div.c-article-info.c-article__info.l-extra-padding > span:nth-child(3").innerText;

            document.querySelector(".c-article__body").childNodes.forEach((ele) => {
                if (ele.tagName === "P" )  {
                    contentArr.push(ele.innerHTML);
                }else if (ele.tagName === "IFRAME") {
                    contentArr.push(ele.outerHTML);
                }
            });


            return {"title": title,"time": time,"author": author,"content":  contentArr.join("<br><br>")};

        })

        await page.screenshot({path: count+".png"});

        return data;


    }

    async loadMoreNews(page) {

    }

};