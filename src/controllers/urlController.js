import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function shortenUrl(req, res) {
    const { url } = req.body;

    const shortUrl = Math.random().toString(36).substring(2,7);



    try {
      res.status(201).send(result);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }