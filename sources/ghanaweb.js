const puppeteer = require('puppeteer');
const cheerio = require('cheerio');




exports.GhanaWeb = class {

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
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://www.ghanaweb.com/GhanaHomePage/NewsArchive/browse.archive.php?more');

            let data = await page.evaluate(() => {
                const arr = [];
                document.querySelectorAll(".left_artl_list > div > ul > li").forEach((ele) => {
                    arr.push(ele.innerHTML);
                });
                return arr;
            });

            const newsArr = [];

            let count = 0;
            for (const html of data) {

                const $ = cheerio.load(html);

                let link = $("a").attr("href");
                let title = $("a").attr("title");

                let details = await this.getNewsDetails(page,link,count);

                this.knex("news").insert(
                    {"source": "ghanaweb",
                        "title": title,
                        "url": "https://ghanaweb.com"+link,
                        "content": details.content,
                        "image_url": details.image
                    }).then(r  =>{
                    console.log("added successfully");
                }).catch(e => {
                    console.log(e);
                });

                count++;
            }

            await browser.close();

            return newsArr;
        })();
    }


    async getNewsDetails (page,url,count){

        await page.goto("https://www.ghanaweb.com"+url);

        let data = await page.evaluate( () => {

            let medsection = document.querySelector("#medsection1 > h1");

            if (medsection !== null) {
                return {};
            }else {

                var imageCaption = " ";
                var image = " ";
                var content = " ";

                if (document.querySelector(".image_caption > span") != null) {
                    imageCaption = document.querySelector(".image_caption > span").innerHTML;
                }
                if (document.querySelector(".article-image > a > img") != null) {
                    image = document.querySelector(".article-image > a > img").getAttribute("src");
                    image = image.replace(".295","");
                }

                if (document.querySelector("#article-123") != null) {
                    content = document.querySelector("#article-123").innerHTML;
                }

                return {"image_caption": imageCaption,"image": image,"content": content};
            }

        });

        await page.screenshot({path: count+".png"});

        return data;
    }



};