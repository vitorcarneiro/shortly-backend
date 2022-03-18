import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function shortenUrl(req, res) {
    const { url } = req.body;
    const userId = res.locals.user.id;

    try {
      const existingLongUrl = await connection.query(`
        SELECT * FROM "longUrls"
          WHERE "longUrl"=$1`, [url]);

      let longUrlId = null;
      if (existingLongUrl.rowCount > 0) {
        longUrlId = existingLongUrl.rows[0].id;
      
      } else {
        await connection.query(`
          INSERT INTO 
            "longUrls"("longUrl") 
            VALUES ($1)
          `, [url]);

        const newLongUrl = await connection.query(`
          SELECT id FROM "longUrls"
            WHERE "longUrl"=$1`, [url]);

        longUrlId = newLongUrl.rows[0].id;          
      }

      let shortUrl = '';
      function generateShortUrl() {
        shortUrl = Math.random().toString(36).substring(2, 7);
        return;
      }

      generateShortUrl();
      const existingShortUrl = await connection.query(`
      SELECT * FROM "shortUrls"
        WHERE "shortUrl"=$1`, [shortUrl]);
        
      if (existingShortUrl.rowCount > 0) {
        generateShortUrl();
      }
      
      await connection.query(`
          INSERT INTO 
            "shortUrls" ("shortUrl", "userId", "longUrlId") 
            VALUES ($1, $2, $3)
          `, [shortUrl, userId, longUrlId]);

      res.status(201).send({
        "url": shortUrl
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }