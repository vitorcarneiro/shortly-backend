import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function createUser(req, res) {
  const user = req.body;

  try {
    const existingUsers = await connection.query('SELECT * FROM users WHERE email=$1', [user.email])
    if (existingUsers.rowCount > 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);

    await connection.query(`
      INSERT INTO 
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `, [user.name, user.email, passwordHash])

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUserUrls(req, res) {
  const userId = req.params.id;

  try {
    const userData = await connection.query(`
      SELECT u.id, u.name, SUM(s."visitCount") AS "visitCount"
        FROM users u
        JOIN "shortUrls" s ON u.id = s."userId"
          WHERE u.id=$1
          GROUP BY u.id`, [userId]);

    if (userData.rowCount === 0) { return res.sendStatus(404) };

    const userUrls = await connection.query(`
      SELECT s.id, s."shortUrl", l."longUrl", s."visitCount"
        FROM "shortUrls" s 
        JOIN "longUrls" l
          ON l.id = s."longUrlId"
        WHERE "userId"=$1`, [userId]);

    res.send({...userData.rows[0], "shortenedUrls": userUrls.rows})
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}