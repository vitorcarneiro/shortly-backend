import { Router } from "express";
import { shortenUrl, findUrl, deleteShortUrl } from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();
urlRouter.post('/urls/shorten', validateSchemaMiddleware(urlSchema), validateTokenMiddleware, shortenUrl);
urlRouter.get('/urls/:shortUrl', findUrl);
urlRouter.delete('/urls/:id', validateTokenMiddleware, deleteShortUrl);
export default urlRouter;