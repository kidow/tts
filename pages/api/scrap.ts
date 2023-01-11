import type { NextApiRequest, NextApiResponse } from 'next'
import urlMetadata from 'url-metadata'
import puppeteer from 'puppeteer-core'
import * as cheerio from 'cheerio'
import chrome from 'chrome-aws-lambda'

const IS_DEV = process.env.NODE_ENV === 'development'
const executablePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (typeof req.query.url !== 'string' || !req.query.url) {
    res.json({ success: false, message: 'req.query.url is not string type.' })
    return
  }

  let text: string = ''

  try {
    const browser = await puppeteer.launch({
      args: IS_DEV ? [] : chrome.args,
      executablePath: IS_DEV ? executablePath : await chrome.executablePath,
      headless: IS_DEV ? true : chrome.headless,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    await page.goto(req.query.url)
    const content = await page.content()
    const $ = cheerio.load(content)

    // Brunch
    if (req.query.url.startsWith('https://brunch.co.kr/')) {
      text = $('.wrap_body > p.item_type_text').text()
    }

    await browser.close()
    res.json({ success: true, result: text })
  } catch (err) {
    res.json({ success: false, result: err })
  }
}
