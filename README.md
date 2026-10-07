# מטלת סיום – MongoDB | שרת לניהול חנות וירטואלית

📋 טבלת עמידה מלאה בדרישות המטלה נמצאת בקובץ [CHECKLIST.md](./CHECKLIST.md)

🗂️ תכנון מפורט של ה-Collections, השדות והקשרים נמצא בקובץ [DB_SCHEMA.md](./DB_SCHEMA.md)

שרת REST API לניהול חנות וירטואלית שנבנה באמצעות **Node.js, Express, MongoDB, Mongoose ו-Zod**.
כל הבדיקות מתבצעות באמצעות **Postman** (אין צד לקוח).

---

## התקנה והרצה

```bash
npm install
cp .env.example .env     # ולעדכן את פרטי החיבור
npm run dev              # או: npm start
npm run seed             # אופציונלי: מילוי הדאטהבייס בנתוני דמו
```

קובץ `.env`:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/virtual_store
NODE_ENV=development
```

השרת עולה בכתובת: `http://localhost:3000`

---

## מבנה הפרויקט

```
virtual-store-api/
├── server.js                  # נקודת הכניסה של האפליקציה
├── .env / .env.example        # מידע רגיש
├── postman/
│   └── VirtualStore.postman_collection.json
└── src/
    ├── config/db.js           # חיבור ל-MongoDB
    ├── models/                # User, Category, Product, Order
    ├── controllers/           # הלוגיקה העסקית
    ├── routes/                # הגדרת ה-Endpoints
    ├── validations/           # סכמות Zod
    ├── middlewares/           # validate, errorHandler, notFound
    └── utils/                 # ApiError, asyncHandler, seed
```

---

## מבנה ה-Collections והקשרים

| Collection | שדות עיקריים | קשרים |
|---|---|---|
| **users** | fullName, email (unique), password, phone, role, addresses[] , isActive | מקושר להזמנות דרך `Order.user` |
| **categories** | name (unique), description, isActive | מקושרת למוצרים דרך `Product.category` |
| **products** | name, description, price, stock, category (ref), tags[], images[] | `category` → **ref** ל-Category |
| **orders** | user (ref), items[] , totalPrice, status, shippingAddress | `user` → **ref** ל-User, `items.product` → **ref** ל-Product |

`Order.items` הוא **מערך של תת-מסמכים**, כל אחד מכיל `product` (ref), `quantity`, `unitPrice`, `lineTotal`.
המחירים מחושבים **בצד השרת בלבד** ולא מתקבלים מהלקוח.

---

## Endpoints

### Users
| Method | Route | תיאור |
|---|---|---|
| POST | `/api/users` | יצירת משתמש (ולידציית Zod) |
| GET | `/api/users` | כל המשתמשים |
| GET | `/api/users/:id` | משתמש לפי מזהה |
| GET | `/api/users/:id/orders` | כל ההזמנות של משתמש מסוים (populate) |
| PUT | `/api/users/:id` | עדכון משתמש |
| DELETE | `/api/users/:id` | מחיקת משתמש (חסום אם יש לו הזמנות) |

### Categories
| Method | Route | תיאור |
|---|---|---|
| POST | `/api/categories` | יצירת קטגוריה |
| GET | `/api/categories` | כל הקטגוריות |
| GET | `/api/categories/products-count` | **מספר המוצרים בכל קטגוריה** (aggregation) |
| GET | `/api/categories/:id` | קטגוריה לפי מזהה + מספר מוצרים |
| PUT | `/api/categories/:id` | עדכון קטגוריה |
| DELETE | `/api/categories/:id` | מחיקה (חסומה אם יש בה מוצרים) |

### Products
| Method | Route | תיאור |
|---|---|---|
| POST | `/api/products` | יצירת מוצר (ולידציית Zod + בדיקת קיום קטגוריה) |
| GET | `/api/products` | כל המוצרים + סינון `?category=&minPrice=&maxPrice=&search=&inStock=` (ערכי מחיר לא מספריים מחזירים 400, וטקסט החיפוש עובר escaping) |
| GET | `/api/products/category/:categoryId` | **מוצרים לפי קטגוריה** |
| GET | `/api/products/:id` | מוצר לפי מזהה (populate של הקטגוריה) |
| PUT | `/api/products/:id` | עדכון מוצר |
| DELETE | `/api/products/:id` | מחיקת מוצר (חסומה אם המוצר מופיע בהזמנה קיימת) |

### Orders
| Method | Route | תיאור |
|---|---|---|
| POST | `/api/orders` | יצירת הזמנה: בדיקת קיום משתמש ומוצרים, בדיקת מלאי, חישוב מחיר בשרת, הפחתת מלאי |
| GET | `/api/orders` | כל ההזמנות (`?status=&user=`) |
| GET | `/api/orders/:id` | **הזמנה יחד עם פרטי המשתמש והמוצרים** (populate מקונן) |
| GET | `/api/orders/user/:userId` | כל ההזמנות של משתמש + סך ההוצאה |
| PATCH | `/api/orders/:id/status` | עדכון סטטוס ההזמנה (סטטוס `cancelled` מחזיר את המלאי) |
| DELETE | `/api/orders/:id` | מחיקת הזמנה והחזרת המלאי |

---

## דוגמאות לגוף בקשה

**יצירת משתמש**
```json
{
  "fullName": "Israel Israeli",
  "email": "israel@example.com",
  "password": "123456",
  "phone": "050-1234567",
  "addresses": [{ "city": "Haifa", "street": "Herzl", "houseNumber": 12 }]
}
```

**יצירת מוצר**
```json
{
  "name": "Dell XPS 13",
  "price": 4500,
  "stock": 10,
  "category": "<categoryId>",
  "tags": ["laptop", "dell"]
}
```

**יצירת הזמנה** (ללא מחירים – הם מחושבים בשרת)
```json
{
  "user": "<userId>",
  "items": [
    { "product": "<productId>", "quantity": 2 },
    { "product": "<productId2>", "quantity": 1 }
  ]
}
```

---

## עמידה בדרישות המטלה

| דרישה | מימוש |
|---|---|
| References בין Collections | `Product.category`, `Order.user`, `Order.items.product` |
| מערכים | `Order.items[]`, `Product.tags[]`, `Product.images[]`, `User.addresses[]` |
| `populate()` | בהצגת מוצרים, הזמנות והזמנות של משתמש (כולל populate מקונן) |
| CRUD | מלא למוצרים ולמשתמשים, יצירה/הצגה/עדכון/מחיקה לקטגוריות והזמנות |
| Validation ב-Mongoose | `required`, `min`, `max`, `minlength`, `enum`, `match`, `unique`, custom validator |
| Zod + `safeParse()` | `src/validations/*` דרך המידלוור `src/middlewares/validate.js` |
| חלוקה ל-Models / Routes / Controllers | תיקיות נפרדות תחת `src/` |
| async/await | בכל הקונטרולרים, עטוף ב-`asyncHandler` |
| טיפול בשגיאות | `errorHandler` גלובלי (Zod, Mongoose Validation, CastError, duplicate key, 404, 500) |
| HTTP Status Codes | 200 / 201 / 400 / 404 / 409 / 500 |
| קובץ `.env` | `PORT`, `MONGO_URI`, `NODE_ENV` |
| Postman | קולקציה מוכנה בתיקיית `postman/` |

> **הערה:** הפחתת המלאי מתבצעת בפעולת `updateOne` אטומית עם התנאי `stock >= quantity`,
> כך ששתי הזמנות מקבילות אינן יכולות לקחת את אותו פריט אחרון. במקרה של כשלון מתבצע rollback מלא.
> הקובץ `.env` מוחרג ב-`.gitignore`, ולכן ב-Repository נמצא `.env.example` שאותו יש להעתיק ל-`.env`.

---

## בדיקה ב-Postman

הקולקציה `postman/VirtualStore.postman_collection.json` מכילה **48 בקשות ב-6 תיקיות**,
כולל בדיקות אוטומטיות (`pm.test`) לקוד הסטטוס ולתוכן התשובה.

1. לייבא את הקובץ ל-Postman (Import → File).
2. לוודא שהמשתנה `baseUrl` מצביע על `http://localhost:3000`.
3. להריץ עם **Collection Runner** מלמעלה למטה - הקולקציה בנויה בסדר הנכון:

| תיקייה | תוכן |
|---|---|
| 0. Health check | בדיקת עליית השרת + מסלול לא קיים (404) |
| 1. Categories | יצירה, שגיאת Zod, שם כפול (409), הצגה, עדכון, 404, מזהה לא תקין |
| 2. Products | יצירה, שגיאות, הצגה, סינון, מוצרים לפי קטגוריה, מספר מוצרים בכל קטגוריה |
| 3. Users | יצירה, שגיאת Zod, אימייל כפול (409), הצגה, עדכון |
| 4. Orders | יצירת הזמנה, בדיקת ירידת מלאי, חוסר מלאי, מוצר/משתמש לא קיימים, populate, סטטוס |
| 5. Cleanup | מחיקות בסדר הנכון + בדיקה שהמלאי חזר |

המזהים (`categoryId`, `productId`, `userId`, `orderId`) נשמרים אוטומטית למשתני הקולקציה,
ולכן אין צורך להעתיק ידנית מזהים בין בקשות.

### בדיקה מהטרמינל (בלי Postman)

כשהשרת רץ (`npm run dev`), פותחים טרמינל נוסף באותה תיקייה ומריצים:

```bash
npm run test:api
```

הסקריפט `scripts/api-test.js` עובר על אותו תרחיש כמו הקולקציה ומדפיס PASS / FAIL לכל בקשה.
גם הקולקציה וגם הסקריפט משתמשים בשמות ייחודיים בכל הרצה, ולכן אפשר להריץ אותם עם נתוני `seed` או בלעדיהם.
