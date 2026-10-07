# בדיקת עמידה בדרישות המטלה

טבלה המקשרת כל דרישה מהמטלה למיקום המדויק בקוד.

## דרישות פונקציונליות

| # | דרישה | מימוש בקוד |
|---|---|---|
| 1 | יצירה, הצגה, עדכון ומחיקה של מוצרים | `src/routes/productRoutes.js` + `src/controllers/productController.js` |
| 2 | יצירה והצגה של קטגוריות | `src/routes/categoryRoutes.js` + `src/controllers/categoryController.js` |
| 3 | יצירת משתמשים | `src/routes/userRoutes.js` + `src/controllers/userController.js` |
| 4 | יצירת הזמנה הכוללת מספר מוצרים וכמויות | `src/controllers/orderController.js` - הפונקציה `createOrder` (מערך `items` עם `product` + `quantity`) |
| 5 | בדיקה שהמוצרים קיימים ושקיים מלאי מספיק | `src/controllers/orderController.js` - הפונקציה `createOrder` (בדיקת קיום מוצרים ובדיקת מלאי) |
| 6 | עדכון המלאי לאחר ביצוע הזמנה | `src/controllers/orderController.js` - `createOrder` - `updateOne` אטומי עם `$inc` |
| 7 | חישוב מחיר ההזמנה בצד השרת | `src/controllers/orderController.js` - `createOrder` - המחיר נלקח מה-DB, לא מהלקוח |
| 8 | הצגת הזמנה עם פרטי המשתמש והמוצרים | `src/controllers/orderController.js` - `populateOrder` - `populate` מקונן |
| 9 | הצגת כל ההזמנות של משתמש מסוים | `src/controllers/orderController.js` - `getOrdersByUser` (`GET /api/orders/user/:userId`) |
| 10 | הצגת מוצרים לפי קטגוריה | `src/controllers/productController.js` - `getProductsByCategory` (`GET /api/products/category/:categoryId`) |
| 11 | הצגת מספר המוצרים בכל קטגוריה | `src/controllers/categoryController.js` - `getProductsCountByCategory` (`aggregate` עם `$group`) |

## דרישות MongoDB

| דרישה | מימוש |
|---|---|
| References בין Collections | `Product.category` → Category, `Order.user` → User, `Order.items.product` → Product |
| מערכים | `Order.items[]`, `Product.tags[]`, `Product.images[]`, `User.addresses[]` |
| `populate()` | 9 שימושים, כולל populate מקונן (הזמנה → מוצרים → קטגוריה) |
| פעולות CRUD | Create / Read / Update / Delete בכל ארבעת ה-Collections |
| Validation ב-Mongoose | User: 13 כללים, Order: 14, Product: 9, Category: 5 (`required`, `min`, `max`, `minlength`, `enum`, `match`, `unique`, custom validator) |

## דרישות Zod

| דרישה | מימוש |
|---|---|
| יצירת משתמש | `src/validations/user.validation.js` |
| יצירת מוצר | `src/validations/product.validation.js` |
| יצירת הזמנה | `src/validations/order.validation.js` |
| שימוש ב-`safeParse()` | `src/middlewares/validate.js` |
| טיפול במידע לא תקין | החזרת `400` עם מערך `errors` מפורט (שדה + הודעה) |

## דרישות שרת

| דרישה | מימוש |
|---|---|
| חלוקה ל-Models / Routes / Controllers | תיקיות נפרדות תחת `src/` |
| `async/await` | 28 פונקציות async, ללא callbacks כלל |
| טיפול בשגיאות | `src/middlewares/errorHandler.js` + `asyncHandler` בכל קונטרולר |
| HTTP Status Codes | 200, 201, 400, 404, 409, 500 |
| קובץ `.env` | `src/config/db.js` , `server.js` (PORT) |
| בדיקה ב-Postman | `postman/VirtualStore.postman_collection.json` - 48 בקשות עם `pm.test` |

## דרישות הגשה

| דרישה | סטטוס |
|---|---|
| שם ות"ז בראש הקובץ הראשי |  מולא בראש `server.js` |
| Repository ציבורי ב-GitHub | **יש להעלות** |
