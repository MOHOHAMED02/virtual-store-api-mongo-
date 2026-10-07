# תכנון מבנה ה-Collections

**שם מלא:** מוחמד שיבלי
**ת"ז:** 213025042

המערכת מורכבת מ-4 Collections: `users`, `categories`, `products`, `orders`.

## תרשים הקשרים

```
categories (1) ───< products (N)          Product.category  -> Category
users      (1) ───< orders   (N)          Order.user        -> User
orders     (1) ───< items[]  (N) >─── (1) products
                                          Order.items[].product -> Product
```

- קטגוריה אחת מכילה הרבה מוצרים.
- משתמש אחד יכול לבצע הרבה הזמנות.
- הזמנה אחת מכילה מערך של פריטים, וכל פריט מפנה למוצר אחד וכולל כמות.

---

## 1. users

| שדה | סוג | חובה | ערך ברירת מחדל / הגבלות |
|---|---|---|---|
| `_id` | ObjectId | אוטומטי | |
| `fullName` | String | כן | 2-60 תווים |
| `email` | String | כן | ייחודי (`unique`), אותיות קטנות, פורמט אימייל |
| `password` | String | כן | לפחות 6 תווים, לא מוחזר בתשובות ה-API |
| `phone` | String | לא | 7-15 תווים (ספרות, `-`, `+`, רווח, סוגריים) |
| `role` | String | לא | `customer` / `admin`, ברירת מחדל `customer` |
| `addresses` | **מערך** של `{ city, street, houseNumber }` | לא | ברירת מחדל `[]` |
| `isActive` | Boolean | לא | ברירת מחדל `true` |
| `createdAt`, `updatedAt` | Date | אוטומטי | `timestamps` |

## 2. categories

| שדה | סוג | חובה | ערך ברירת מחדל / הגבלות |
|---|---|---|---|
| `_id` | ObjectId | אוטומטי | |
| `name` | String | כן | ייחודי (`unique`), 2-50 תווים |
| `description` | String | לא | עד 300 תווים, ברירת מחדל ריק |
| `isActive` | Boolean | לא | ברירת מחדל `true` |
| `createdAt`, `updatedAt` | Date | אוטומטי | |

## 3. products

| שדה | סוג | חובה | ערך ברירת מחדל / הגבלות |
|---|---|---|---|
| `_id` | ObjectId | אוטומטי | |
| `name` | String | כן | 2-100 תווים |
| `description` | String | לא | עד 1000 תווים |
| `price` | Number | כן | לא שלילי |
| `stock` | Number | כן | לא שלילי, ברירת מחדל `0` |
| `category` | **ObjectId (Reference ל-`Category`)** | כן | |
| `tags` | **מערך** של String | לא | ברירת מחדל `[]` |
| `images` | **מערך** של String | לא | ברירת מחדל `[]` |
| `isActive` | Boolean | לא | ברירת מחדל `true` |
| `createdAt`, `updatedAt` | Date | אוטומטי | |

אינדקס: `{ name: 1, category: 1 }`.

## 4. orders

| שדה | סוג | חובה | ערך ברירת מחדל / הגבלות |
|---|---|---|---|
| `_id` | ObjectId | אוטומטי | |
| `user` | **ObjectId (Reference ל-`User`)** | כן | |
| `items` | **מערך** של תת-מסמכים (ראו בהמשך) | כן | לפחות פריט אחד |
| `totalPrice` | Number | כן | מחושב **בשרת** בלבד |
| `status` | String | לא | `pending` / `paid` / `shipped` / `delivered` / `cancelled`, ברירת מחדל `pending` |
| `shippingAddress` | `{ city, street, houseNumber }` | לא | |
| `createdAt`, `updatedAt` | Date | אוטומטי | |

### מבנה כל פריט במערך `items`

| שדה | סוג | חובה | הגבלות |
|---|---|---|---|
| `product` | **ObjectId (Reference ל-`Product`)** | כן | |
| `quantity` | Number | כן | לפחות 1 |
| `unitPrice` | Number | כן | המחיר של המוצר ברגע ההזמנה, נלקח מה-DB |
| `lineTotal` | Number | כן | `unitPrice * quantity`, מחושב בשרת |

> `unitPrice` נשמר בתוך ההזמנה כדי שהזמנה ישנה לא תשתנה אם מחיר המוצר ישתנה בעתיד.

---

## סיכום מה משמש איפה

| דרישה | היכן |
|---|---|
| References | `Product.category`, `Order.user`, `Order.items[].product` |
| מערכים | `User.addresses`, `Product.tags`, `Product.images`, `Order.items` |
| `populate()` | הצגת מוצר עם קטגוריה, והצגת הזמנה עם משתמש ומוצרים |
| Validation ב-Mongoose | `required`, `min`, `max`, `minlength`, `maxlength`, `enum`, `match`, `unique`, ו-`validate` מותאם בהזמנה |
