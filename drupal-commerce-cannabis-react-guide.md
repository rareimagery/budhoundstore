# Building a React App to Display Cannabis Store Info from Drupal Commerce

## Overview

This guide walks you through creating a simple React application that connects to a Drupal Commerce backend and displays a cannabis store's company name and address.

---

## Prerequisites

- Node.js (v18+) and npm installed
- A running Drupal Commerce instance with the JSON:API module enabled
- A cannabis store entity (or commerce store) already created in Drupal

---

## Step 1: Set Up the React Project

```bash
npx create-react-app cannabis-store-viewer
cd cannabis-store-viewer
```

---

## Step 2: Enable JSON:API in Drupal

Drupal Commerce exposes store data via the **JSON:API** module (included in Drupal core since 8.7+).

1. Log into your Drupal admin panel.
2. Go to **Extend** and ensure **JSON:API** is enabled.
3. Verify the endpoint is accessible by visiting:

```
https://your-drupal-site.com/jsonapi/commerce_store/online
```

> Replace `online` with your store type machine name (e.g., `online`, `physical`, or a custom type like `cannabis_store`).

The response will look something like:

```json
{
  "data": [
    {
      "type": "commerce_store--online",
      "id": "some-uuid",
      "attributes": {
        "name": "Green Leaf Dispensary",
        "mail": "info@greenleaf.com",
        "address": {
          "country_code": "US",
          "administrative_area": "CA",
          "locality": "Los Angeles",
          "postal_code": "90001",
          "address_line1": "420 Main Street",
          "address_line2": ""
        }
      }
    }
  ]
}
```

---

## Step 3: Configure CORS on Drupal

To allow your React app to make requests to Drupal, update CORS settings.

Edit `sites/default/services.yml`:

```yaml
cors.config:
  enabled: true
  allowedHeaders: ['Content-Type', 'Authorization']
  allowedMethods: ['GET']
  allowedOrigins: ['http://localhost:3000']
  supportsCredentials: false
```

Clear Drupal's cache after making this change:

```bash
drush cr
```

---

## Step 4: Create the Store Component

Replace the contents of `src/App.js` with:

```jsx
import React, { useEffect, useState } from "react";
import "./App.css";

const DRUPAL_BASE_URL = "https://your-drupal-site.com";
const STORE_TYPE = "online"; // change to your store type machine name

function App() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${DRUPAL_BASE_URL}/jsonapi/commerce_store/${STORE_TYPE}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setStores(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading stores...</div>;
  if (error) return <div className="container error">Error: {error}</div>;
  if (stores.length === 0)
    return <div className="container">No stores found.</div>;

  return (
    <div className="container">
      <h1>Cannabis Store Directory</h1>
      {stores.map((store) => {
        const { name, address } = store.attributes;
        return (
          <div key={store.id} className="store-card">
            <h2>{name}</h2>
            <p className="address">
              {address.address_line1}
              {address.address_line2 && `, ${address.address_line2}`}
              <br />
              {address.locality}, {address.administrative_area}{" "}
              {address.postal_code}
              <br />
              {address.country_code}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default App;
```

---

## Step 5: Add Basic Styling

Replace the contents of `src/App.css` with:

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

h1 {
  color: #2d6a4f;
  margin-bottom: 24px;
}

.store-card {
  background: white;
  border-left: 4px solid #2d6a4f;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.store-card h2 {
  margin: 0 0 8px 0;
  color: #1b4332;
}

.address {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.error {
  color: #d00;
}
```

---

## Step 6: Set Your Drupal URL

Open `src/App.js` and update these two constants at the top:

```js
const DRUPAL_BASE_URL = "https://your-drupal-site.com"; // your actual Drupal URL
const STORE_TYPE = "online"; // your store type machine name
```

> **Tip:** To find your store type, go to Drupal admin → Commerce → Configuration → Store types.

---

## Step 7: Run the App

```bash
npm start
```

Visit `http://localhost:3000` to see your store's name and address.

---

## Optional: Environment Variables

For cleaner configuration, use a `.env` file in the project root:

```
REACT_APP_DRUPAL_URL=https://your-drupal-site.com
REACT_APP_STORE_TYPE=online
```

Then update `App.js`:

```js
const DRUPAL_BASE_URL = process.env.REACT_APP_DRUPAL_URL;
const STORE_TYPE = process.env.REACT_APP_STORE_TYPE;
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **CORS error in browser** | Ensure `services.yml` has CORS enabled and cache is cleared |
| **404 on JSON:API endpoint** | Verify JSON:API module is enabled and the store type machine name is correct |
| **Empty store list** | Confirm at least one store entity exists in Commerce → Stores |
| **Authentication required** | Check Drupal permissions: Anonymous users need "View commerce_store" permission |

---

## Project Structure

```
cannabis-store-viewer/
├── public/
├── src/
│   ├── App.js          # Main component with API call
│   ├── App.css         # Styling
│   └── index.js        # Entry point
├── .env                # (optional) environment config
└── package.json
```
