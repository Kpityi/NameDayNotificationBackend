//get Occasion notifications

export const sqlOccasions = `SELECT  id, 
month, 
day, 
occasion 
FROM occasions_notifications WHERE user_id=?`;

//Delete Occasion notification
export const sqlDeleteOccasion =
  "DELETE FROM occasions_notifications WHERE id = ?";

//Add Occasion
export const sqlAddOccasion = `INSERT INTO occasions_notifications(user_id, month, day, occasion) VALUES (?,?,?,?)`;

//SQL: occasion query three days earlier
export const sqlOccasionNotification3DayBefore = `SELECT occasion.user_id, 
users.email,
users.last_name,
occasion.occasion 
FROM  occasions_notifications AS occasion                                              
INNER JOIN users ON occasion.user_id=users.id                                                 
WHERE occasion.month=? AND occasion.day=?`;

//SQL: occasion today
export const SqloccasionNotificationToday = `SELECT occasion.user_id, 
users.email,
users.last_name,
occasion.occasion 
FROM  occasions_notifications AS occasion                                              
INNER JOIN users ON occasion.user_id=users.id                                                 
WHERE occasion.month=? AND occasion.day=?`;
