# Hookly API Specification

This document provides a comprehensive specification for the backend API required to power the Hookly frontend.

---

## 1. Authentication (`/auth`)

### User Model

This is the standard user object returned from protected endpoints.

```json
{
  "id": "c7a8b9d0-e1f2-g3h4-i5j6-k7l8m9n0o1p2",
  "name": "Alex Duran",
  "email": "alex.duran@example.com",
  "subscription": {
    "plan": "Trial", // "Trial", "Starter", "Pro"
    "generationsUsed": 5,
    "generationsLimit": 15,
    "trialEndsAt": "2023-12-31T23:59:59.000Z" // or null
  }
}
```

---

### `POST /auth/register`

- **Description**: Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "Alex Duran",
    "email": "alex.duran@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response (201)**: Returns `accessToken` and `refreshToken` in cookies and user object in body.

---

### `POST /auth/login`

- **Description**: Authenticates a user.
- **Request Body**:
  ```json
  {
    "email": "alex.duran@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response (200)**: Returns `accessToken` and `refreshToken` in cookies and user object in body.

---

### `GET /auth/profile`

- **Description**: Retrieves the profile of the currently authenticated user.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200)**: The User Model.

---

### `POST /auth/logout`

- **Description**: Logs the user out by clearing cookies.
- **Response (204)**: No content.

---

## 2. Generations (`/generations`)

### Generation Model

```json
{
  "id": "gen_1a2b3c4d",
  "topic": "My top 5 tips for learning a new language",
  "platform": "TikTok",
  "createdAt": "2023-10-27T10:00:00.000Z",
  "viralScore": 8.7,
  "script": "**Hook:** You've been learning languages wrong...\n\n**Script:**...\n\n**CTA:**..."
}
```

---

### `POST /generations`

- **Description**: Creates a new script generation.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "topic": "A tutorial on how to make the perfect cold brew coffee",
    "platform": "TikTok"
  }
  ```
- **Response (201)**: The full Generation Model object.

---

### `GET /generations`

- **Description**: Retrieves a paginated list of the user's generation history.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Query Parameters**:
  - `search` (string, optional): Filter by topic.
  - `platform` (string, optional): Filter by platform.
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "id": "gen_1a2b3c4d",
        "topic": "My top 5 tips...",
        "platform": "TikTok",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "viralScore": 8.7
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
  ```

---

### `DELETE /generations/:id`

- **Description**: Deletes a specific generation.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (204)**: No content.

---

## 3. Settings (`/settings`)

### `PUT /settings/profile`

- **Description**: Updates the user's profile information.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "name": "Alexandra Duran"
  }
  ```
- **Response (200)**: The updated User Model.

---

### `PUT /settings/password`

- **Description**: Updates the user's password.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "currentPassword": "strongpassword123",
    "newPassword": "evenstrongerpassword456"
  }
  ```
- **Response (204)**: No content.

---

## 4. Billing (`/billing`)

### `POST /billing/create-checkout-session`

- **Description**: Creates a Stripe checkout session for a user to upgrade their plan.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "planId": "pro_monthly", // or "pro_yearly"
    "successUrl": "https://hookly.com/dashboard?upgraded=true",
    "cancelUrl": "https://hookly.com/pricing"
  }
  ```
- **Response (200)**:
  ```json
  {
    "sessionId": "cs_test_a1b2c3d4..."
  }
  ```

### `POST /billing/manage-subscription`

- **Description**: Creates a Stripe customer portal session for the user to manage their subscription.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "returnUrl": "https://hookly.com/settings"
  }
  ```
- **Response (200)**:
  ```json
  {
    "portalUrl": "https://billing.stripe.com/p/session/..."
  }
  ```

---
