# AysKart — Static E-commerce V1

A responsive HTML, CSS and Vanilla JavaScript storefront. Orders are handed off to WhatsApp; there is no backend, database, payment gateway or admin panel.

## 1. Run locally

Because the product data is loaded from JavaScript and the site is static, you can open `index.html` directly in a browser. For best results, use VS Code Live Server.

## 2. Configure the store WhatsApp number

Open `js/app.js` and replace:

```js
const STORE_WHATSAPP = "91XXXXXXXXXX";
```

with the seller's WhatsApp number in international digits-only format. For India, use `91` followed by the 10-digit mobile number. Do not include `+`, spaces or hyphens.

## 3. Add or edit products

Edit `js/products.js`. Each product uses this structure:

```js
{
  id: "p009",
  name: "Product name",
  category: "Category",
  description: "Product description",
  price: 999,
  discountPrice: 799,
  image: "https://your-image-url",
  badge: "NEW",
  featured: true
}
```

- `id` must be unique.
- `price` is the original price.
- `discountPrice` is optional; if omitted, `price` is used.
- `image` should be a publicly accessible image URL. Use optimised product images.
- Set `badge` to an empty string to hide the badge.
- Set `featured` to `true` to prioritise the product in Featured sorting.

The sample products and image links are placeholders. Replace them with the client's real products, prices, descriptions and images before launch.

## 4. Preview

Open `index.html` using Live Server. Test:
- category filters and search
- product details
- add/remove items and quantity controls
- cart persistence after refresh
- checkout form validation
- WhatsApp handoff using the real store number

## 5. Publish on GitHub Pages

1. Create a GitHub repository, for example `ayskart`.
2. Upload all files and folders, keeping the same structure.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Wait for the published URL shown in the Pages section.

If you connect a custom domain later, configure it in GitHub Pages and update DNS at your domain registrar.

## Important V1 limitations

- WhatsApp opens with a prefilled message. The customer must press **Send** in WhatsApp.
- The site does not store orders or customer information.
- The site does not reserve stock or automatically reduce inventory.
- The seller must confirm stock, delivery charges, payment method and order acceptance manually.
- Customers can edit the WhatsApp message before sending.
- There is no online payment, login, admin dashboard or order tracking.

## Brand palette

- Navy: `#092B4C`
- Orange: `#F47721`
- White: `#FFFFFF`
- Light background: `#F7F8FA`
