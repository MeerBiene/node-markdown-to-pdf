const puppeteer = require('puppeteer');
const { createWriteStream, realpath } = require('fs');
const express = require('express')
const app = express()
const hbs = require('handlebars')
const converter = new (require('showdown')).Converter()
const fileupload = require('express-fileupload');

async function html(req) {
  const betterhtml = await converter.makeHtml(req.query.md)
  const template = hbs.compile(betterhtml)
  return template()
}

async function printPDF(req) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const HTML = await html(req)
  
  await page.setContent(HTML)
  
  //await page.goto(req.query.url, {waitUntil: 'networkidle0'});
  //await page.addStyleTag({ content: '.nav { display: none} .navbar { border: 0px} #print-button {display: none}' })
  //const output = createWriteStream('./ouptut.pdf')
  const pdf = await page.pdf({ format: 'A4' });
 
  await browser.close();

  //pdf.pipe(output)
  return pdf
}

app.use(fileupload());

app.post("/", async (req,res) => {
  console.log(req.body)
  printPDF(req).then(pdf => {
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
    res.send(pdf)
  })
})

app.listen(5000, () => {
  console.log("app is listening on port 5000")
})