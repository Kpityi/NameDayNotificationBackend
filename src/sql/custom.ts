//get Custom notifications

export const sqlCustom = `SELECT id, date, text FROM custom_notifications WHERE user_id=?`;

//Delete custom notification
export const sqlDeleteCustom = "DELETE FROM custom_notifications WHERE id=?";

//Add custom notification
export const sqlAddCustom = `INSERT INTO custom_notifications(user_id, date, text) VALUES (?,?,?)`;

//SQL: custom query three days earlier
export const SqlcustomNotification3DayBefore = `SELECT cn.user_id, 
users.email,
users.last_name,
cn.text 
FROM  custom_notifications AS cn                                              
INNER JOIN users ON cn.user_id=users.id                                                 
WHERE cn.date=?`;

//SQL: occasion days today
export const sqlCustomNotificationToday = `SELECT cn.user_id, 
users.email,
users.last_name,
cn.text 
FROM  custom_notifications AS cn                                              
INNER JOIN users ON cn.user_id=users.id                                                 
WHERE cn.date=?`;
