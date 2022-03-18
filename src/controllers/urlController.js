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

export async function findUrl(req, res) {
  const {shortUrl} = req.params;
  
  try {
    const existingShortUrl = await connection.query(`
    SELECT s.id, s."shortUrl", l."longUrl" AS url
    FROM "shortUrls" s
    JOIN "longUrls" l ON s."longUrlId"=l.id
      WHERE "shortUrl"=$1`, [shortUrl]);

    if(existingShortUrl.rowCount === 0) { return res.sendStatus(404) }

    res.send(existingShortUrl.rows[0]);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function deleteShortUrl(req, res) {
  const shortUrlId = req.params.id;
  const userId = res.locals.user.id;

  try {
    const existingShortUrl = await connection.query(`
      SELECT * FROM "shortUrls"
        WHERE id=$1`, [shortUrlId]);

    if(existingShortUrl.rows[0].userId !== userId) { return res.sendStatus(401) };
    if(existingShortUrl.rowCount === 0) { return res.sendStatus(404) };

    await connection.query(`
      DELETE FROM "shortUrls"
        WHERE id=$1`, [shortUrlId]);

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}