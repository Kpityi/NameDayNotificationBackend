import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket } from "mysql2";
import transporter from "../config/nodemailer";
import { BACKEND_URL } from "../config/environment";

export const getPostcards = async (req: Request, res: Response) => {
  const sql = `SELECT  postcards.id, 
                      postcards.url, 
                      postcard_types.type 
                  FROM postcards 
                  INNER JOIN postcard_types 
                  On postcards.type_id=postcard_types.id`;

  try {
    const result = await db.query<RowDataPacket[]>(sql);
    if (result.length) {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(409).json(error);
  }
};

export const sendPostcard = async (req: Request, res: Response) => {
  const { url, email, message, name } = req.body;
  const imageUrl = `${BACKEND_URL}/${url}`;
  console.log(imageUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>postcard</title>
    <style>
      main{
        width: 90%;
        margin: 0 auto;
      }
      .title {
        text-align: center;
      }
      .message {
        text-align: justify;
        margin: 2rem 0 1rem 0; 
      }
      .image-container {
        width: 90%;
        margin: 1rem auto;
      }
      .image {
        width: 100%;
      }
    </style>
  </head>
  <body>
    <main>
      <h1 class="title">
        Ezt az üzenetet azért kaptad, mert egy kedves ismerősöd ${name} gondolt rád a mai napon!
      </h1>
        <p class="message">${message}</p>
        <div class="image-container">
          <img class="image" src="${imageUrl}" alt=${imageUrl}/>
        </div>
    </main>
    </h1>
  </body>
</html>
`;
  try {
    await transporter.sendMail({
      to: email,
      subject: "E-képeslap",
      html: html,
    });
    res.status(200).json({ message: "Email küldése sikeres!" });
  } catch (error) {
    res.status(409).json(error);
  }
};
