//get name days notifications

export const sqlNamedays = `SELECT ndn.id, 
 nd.month, 
 nd.day, 
 nd.name 
FROM name_day_notifications AS ndn 
INNER JOIN name_days AS nd ON ndn.name_day_id = nd.id
WHERE ndn.user_id = ?; `;

//delete name days
export const sqlDeleteNameDay = "DELETE FROM name_day_notifications WHERE id=?";

//Add name day
export const sqlAddNameday =
  "INSERT INTO `name_day_notifications`(`user_id`, `name_day_id`) VALUES (?,?)";

//SQL: name day query three days earlier
export const sqlNamedayNotification3DayBefore = `SELECT  ndn.user_id, 
nd.name, 
users.email,
users.last_name 
FROM name_day_notifications AS ndn 
INNER JOIN name_days AS nd ON ndn.name_day_id=nd.id
INNER JOIN users ON ndn.user_id=users.id                                                 
WHERE nd.month=? AND nd.day=?`;

//SQL: name days today
export const sqlNamedayNotificationToday = `SELECT ndn.user_id, 
nd.name, 
users.email,
users.last_name 
FROM name_day_notifications AS ndn 
INNER JOIN name_days AS nd ON ndn.name_day_id=nd.id
INNER JOIN users ON ndn.user_id=users.id                                             
WHERE nd.month=? AND nd.day=?`;
