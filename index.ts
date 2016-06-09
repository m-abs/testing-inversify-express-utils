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
  private index(req: express.Request): string {
    return 'indexi';
  }

  @Get('/async')
  private regexp(req: express.Request, res: express.Response) {
    res.setHeader('Content-Type', 'application/json');
    setTimeout(() => {
      res.status(200).json({
        success: true
      });
    }, 1000);
  }
}

import { Kernel } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

const kernel = new Kernel();
kernel.bind<RootController>('RootController').to(RootController);

const server = new InversifyExpressServer(kernel);

const app: express.Application = server.build();
app.listen(3000);
