import { Router } from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import urlRouter from "./urlRouter.js";

const router = Router();
router.use(authRouter);
router.use(userRouter);
router.use(urlRouter);

export default router;