import express from 'express'
import { googleAuth, logout } from '../controllers/auth.controller'

const authRouter  = express.Router()


authRouter.post("/login",googleAuth)

authRouter.get("/logout",logout)

export default authRouter;