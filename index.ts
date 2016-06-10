/// <reference path="typings/index.d.ts" />
/// <reference path="node_modules/inversify-dts/inversify/inversify.d.ts" />
/// <reference path="node_modules/inversify-dts/inversify-express-utils/inversify-express-utils.d.ts" />
import 'reflect-metadata';

import * as express from 'express';
import { Controller, Get } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import * as session from 'express-session';
import {
  MemoryStore
} from 'express-session';

import * as cookieParser from 'cookie-parser';
import * as uuid from 'node-uuid';
import * as basicAuth from 'basic-auth';

const unauthorized = (res: express.Response) => {
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  res.status(401)
    .end();
};

@Controller('/')
@injectable()
class RootController {
  @Get('/')
  private index(req: express.Request): string {
    console.log(req.session['user']);
    return 'indexi';
  }

  @Get('/auth')
  private auth(req: express.Request, res: express.Response) {
    const user = basicAuth(req);
    console.log(user);
    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    }

    req.session['user'] = {
      name: user.name,
      pass: user.pass,
    };

    res.status(200).end();
  }

  @Get('/async')
  private async(req: express.Request, res: express.Response) {
    setTimeout(() => {
      res.status(200).json({
        success: true
      });
    }, 1000);
  };

  @Get(<any>/\/files\/([^\/]+)\/(.+)/)
  private files(req: express.Request, res: express.Response) {
    return new Promise((resolve) => {
      if (!req.session['user']) {
        res.status(401).end();
        return resolve();
      } else {
        res.status(200).json({
          session: req.session,
        });
      }
    });
  };
}

import { Kernel } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

const kernel = new Kernel();
kernel.bind<RootController>('RootController').to(RootController);

const server = new InversifyExpressServer(kernel);

const app: express.Application = server
  .setConfig((innerApp) => {
    innerApp.use(cookieParser());

    const sessions = new Map<string, string>();
    const sessionCookieName = 'express-session';

    const sessionStore = new MemoryStore();
    const sessionHandler = session({
      resave: true,
      saveUninitialized: true,
      secret: 'hugo',
      name: sessionCookieName,
      store: sessionStore,
    });

    innerApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const fileSessionMatch = req.path.match(/^\/files\/([^\/]+)/);
      if (fileSessionMatch) {
        const uuid = fileSessionMatch[1];
        if (uuid && sessions.has(uuid)) {
          sessionStore.get(sessions.get(uuid), (error, session) => {
            if (error) {
              res.status(401).end();
              return;
            }

            req.session = session;

            next();
          });
        } else {
          res.status(401).end();
        }

        return;
      }

      sessionHandler(req, res, () => {
        if (!req.session['uuid']) {
          req.session['uuid'] = uuid.v4();
          sessions.set(req.session['uuid'], req.session['id']);
        }
        console.log(req.session['id'], req.session['uuid']);

        next();
      });
    });
  })
  .build();
app.listen(3000);
