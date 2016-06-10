/// <reference path="typings/index.d.ts" />
/// <reference path="node_modules/inversify-dts/inversify/inversify.d.ts" />
/// <reference path="node_modules/inversify-dts/inversify-express-utils/inversify-express-utils.d.ts" />
import 'reflect-metadata';

import * as express from 'express';
import { Controller, Get } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';

@Controller('/')
@injectable()
class RootController {
  @Get('/')
  private index(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log('index');
    return next();
  }

  @Get('/')
  private index2(req: express.Request): string {
    console.log('index2');
    return 'indexi';
  }

  @Get('/async')
  private notAsync(req: express.Request, res: express.Response, next: express.NextFunction) {
    return next();
  }

  @Get('/async')
  private async(req: express.Request, res: express.Response) {
    console.log('async');

    return new Promise((resolve) => {
      setTimeout(() => {
        res.status(200).json({
          success: true
        });

        resolve(true);
      }, 1000);
    });
  }
}

import { Kernel } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

const kernel = new Kernel();
kernel.bind<RootController>('RootController').to(RootController);

const server = new InversifyExpressServer(kernel);

const app: express.Application = server.build();
app.listen(3000);
