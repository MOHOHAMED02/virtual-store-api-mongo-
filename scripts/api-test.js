const BASE = process.env.BASE_URL || "http://localhost:3000";
const id = Date.now();
let passed = 0;
let failed = 0;
const ctx = {};

const call = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, body: json };
};

const check = async (name, method, path, body, expected, extra) => {
  try {
    const r = await call(method, path, body);
    let ok = r.status === expected;
    let note = "";
    if (ok && extra) {
      const msg = extra(r.body);
      if (msg) { ok = false; note = ` - ${msg}`; }
    }
    if (ok) { passed++; console.log(`  PASS  ${name} (${r.status})`); }
    else {
      failed++;
      console.log(`  FAIL  ${name} (got ${r.status}, expected ${expected})${note}`);
      if (r.status !== expected) console.log("        ", JSON.stringify(r.body).slice(0, 200));
    }
    return r.body;
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name} - ${e.message}`);
    return {};
  }
};

const ZERO = "000000000000000000000000";

(async () => {
  console.log(`Testing ${BASE}\n`);

  console.log("0. Health");
  await check("server is running", "GET", "/", null, 200);
  await check("unknown route", "GET", "/api/unknown", null, 404);

  console.log("\n1. Categories");
  let b = await check("create category 1", "POST", "/api/categories", { name: `Laptops-${id}`, description: "test" }, 201);
  ctx.cat1 = b.data && b.data._id;
  b = await check("create category 2", "POST", "/api/categories", { name: `Books-${id}` }, 201);
  ctx.cat2 = b.data && b.data._id;
  await check("invalid name (Zod)", "POST", "/api/categories", { name: "A" }, 400);
  await check("duplicate name", "POST", "/api/categories", { name: `Laptops-${id}` }, 409);
  await check("get all", "GET", "/api/categories", null, 200);
  await check("get by id", "GET", `/api/categories/${ctx.cat1}`, null, 200);
  await check("update", "PUT", `/api/categories/${ctx.cat1}`, { description: "updated" }, 200);
  await check("not found", "GET", `/api/categories/${ZERO}`, null, 404);
  await check("invalid id (Zod)", "GET", "/api/categories/not-an-id", null, 400);

  console.log("\n2. Products");
  b = await check("create product 1", "POST", "/api/products",
    { name: "Dell XPS 13", price: 4500, stock: 10, category: ctx.cat1, tags: ["laptop"] }, 201);
  ctx.p1 = b.data && b.data._id;
  b = await check("create product 2", "POST", "/api/products",
    { name: "Clean Code", price: 160, stock: 25, category: ctx.cat2 }, 201);
  ctx.p2 = b.data && b.data._id;
  await check("invalid product (Zod)", "POST", "/api/products", { name: "X", price: -10, stock: 2.5, category: "bad" }, 400);
  await check("category not found", "POST", "/api/products", { name: "Ghost", price: 10, stock: 1, category: ZERO }, 404);
  await check("get all", "GET", "/api/products", null, 200);
  await check("by category", "GET", `/api/products/category/${ctx.cat1}`, null, 200);
  await check("filter by price", "GET", "/api/products?minPrice=100&maxPrice=6000&inStock=true", null, 200);
  await check("get by id (category populated)", "GET", `/api/products/${ctx.p1}`, null, 200,
    (r) => (r.data && r.data.category && r.data.category.name ? "" : "category not populated"));
  await check("update (stock -> 15)", "PUT", `/api/products/${ctx.p1}`, { price: 4300, stock: 15 }, 200);
  await check("products count per category", "GET", "/api/categories/products-count", null, 200,
    (r) => {
      const c1 = r.data.find((c) => c._id === ctx.cat1);
      const c2 = r.data.find((c) => c._id === ctx.cat2);
      if (!c1 || !c2) return "category missing from the result";
      if (c1.productsCount !== 1 || c2.productsCount !== 1) return `counts are ${c1.productsCount}/${c2.productsCount}, expected 1/1`;
      const seedLaptops = r.data.find((c) => c.name === "Laptops");
      if (seedLaptops && seedLaptops.productsCount !== 2) return "seeded Laptops should have 2 products";
      return "";
    });
  await check("delete category with products", "DELETE", `/api/categories/${ctx.cat1}`, null, 400);

  console.log("\n3. Users");
  b = await check("create user", "POST", "/api/users",
    { fullName: "Test Student", email: `user${id}@example.com`, password: "123456", phone: "050-1234567",
      addresses: [{ city: "Haifa", street: "Herzl", houseNumber: 12 }] }, 201,
    (r) => (r.data && r.data.password === undefined ? "" : "password was returned"));
  ctx.u = b.data && b.data._id;
  await check("invalid user (Zod)", "POST", "/api/users", { fullName: "A", email: "bad", password: "1" }, 400);
  await check("duplicate email", "POST", "/api/users", { fullName: "Second", email: `user${id}@example.com`, password: "123456" }, 409);
  await check("get all", "GET", "/api/users", null, 200);
  await check("get by id", "GET", `/api/users/${ctx.u}`, null, 200);
  await check("update", "PUT", `/api/users/${ctx.u}`, { phone: "052-7654321" }, 200);

  console.log("\n4. Orders");
  b = await check("create order (2 products)", "POST", "/api/orders",
    { user: ctx.u, items: [{ product: ctx.p1, quantity: 2 }, { product: ctx.p2, quantity: 1 }] }, 201,
    (r) => {
      const d = r.data;
      const sum = d.items.reduce((s, i) => s + i.lineTotal, 0);
      if (d.totalPrice !== Number(sum.toFixed(2))) return "totalPrice mismatch";
      if (!d.user || !d.user.fullName) return "user not populated";
      if (!d.items[0].product || !d.items[0].product.name) return "product not populated";
      return "";
    });
  ctx.o = b.data && b.data._id;
  await check("stock decreased (15 -> 13)", "GET", `/api/products/${ctx.p1}`, null, 200,
    (r) => (r.data.stock === 13 ? "" : `stock is ${r.data.stock}`));
  await check("not enough stock", "POST", "/api/orders", { user: ctx.u, items: [{ product: ctx.p1, quantity: 99999 }] }, 400);
  await check("product not found", "POST", "/api/orders", { user: ctx.u, items: [{ product: ZERO, quantity: 1 }] }, 404);
  await check("user not found", "POST", "/api/orders", { user: ZERO, items: [{ product: ctx.p1, quantity: 1 }] }, 404);
  await check("empty items (Zod)", "POST", "/api/orders", { user: ctx.u, items: [] }, 400);
  await check("get all", "GET", "/api/orders", null, 200);
  await check("get by id", "GET", `/api/orders/${ctx.o}`, null, 200);
  await check("orders of a user", "GET", `/api/orders/user/${ctx.u}`, null, 200);
  await check("user orders via users route", "GET", `/api/users/${ctx.u}/orders`, null, 200);
  await check("status -> paid", "PATCH", `/api/orders/${ctx.o}/status`, { status: "paid" }, 200);
  await check("invalid status (Zod)", "PATCH", `/api/orders/${ctx.o}/status`, { status: "done" }, 400);
  await check("delete user with orders", "DELETE", `/api/users/${ctx.u}`, null, 400);

  console.log("\n5. Cleanup");
  await check("delete order", "DELETE", `/api/orders/${ctx.o}`, null, 200);
  await check("stock restored (15)", "GET", `/api/products/${ctx.p1}`, null, 200,
    (r) => (r.data.stock === 15 ? "" : `stock is ${r.data.stock}`));
  await check("delete product 1", "DELETE", `/api/products/${ctx.p1}`, null, 200);
  await check("delete product 2", "DELETE", `/api/products/${ctx.p2}`, null, 200);
  await check("delete user", "DELETE", `/api/users/${ctx.u}`, null, 200);
  await check("delete category 1", "DELETE", `/api/categories/${ctx.cat1}`, null, 200);
  await check("delete category 2", "DELETE", `/api/categories/${ctx.cat2}`, null, 200);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
