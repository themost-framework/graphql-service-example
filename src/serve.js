import { serveApplication } from "@themost/test";
import {app} from './app';
const port = process.env.PORT || '8080';
const host = process.env.IP || '0.0.0.0';
// serve
serveApplication(app, port, host);