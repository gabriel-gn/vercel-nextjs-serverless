import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import Puppeteer from 'puppeteer';
import Cheerio from 'cheerio';

@Controller()
export class AppController {
  @Get()
  getHealthcheck() {
    return `Healthcheck Ok`;
  }

  @Get('test')
  async someTestService() {
    const browser = await Puppeteer.launch({
      headless: true,
      // args: ['--proxy-server=socks5://127.0.0.1:9050']
    });

    const page = await browser.newPage();
    await page.goto('https://www.thingiverse.com/');
    const html = await page.content();
    const $ = Cheerio.load(html);

    const thingLinks = [];

    $('.ThingCardBody__cardBodyWrapper--ba5pu')
      .slice(0, 5)
      .each((idx, elem) => {
        const title = $(elem).attr('href');
        thingLinks.push(title);
      });

    browser.close();
    return thingLinks;
  }
}

@ApiTags('Models')
@Controller()
export class ModelsController {}
