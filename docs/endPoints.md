# Blockchain User Content API Documentation

A RESTful API for managing blockchain user data and content interactions.

## Table of Contents
1. [User Endpoints](#user-endpoints)
   - [Get User Data](#get-user-data)
   - [Update User](#update-user)
2. [Content Endpoints](#content-endpoints)
   - [Get Content Info](#get-content-info)
   - [Update Content](#update-content)

---

## User Endpoints

### Get User Data

**Endpoint:**  
`GET /api/user/{user_address}`

**Description:**  
Retrieves user information associated with a specific blockchain wallet address, including engagement metrics such as likes, comments, followers, and following counts.

**Parameters:**  
- `user_address` (path parameter): Blockchain wallet address of the user

**Example Request:**

```python
import requests

url = "http://localhost:3000/api/user/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

response = requests.get(url)
print(response.status_code, response.json())
```

**Response:**  
- **200 OK** – Returns user data
```json
{
  "_id": "6142a8f9e6e7b34a5c8d9e7f",
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "no_of_likes": 15,
  "no_of_comments": 7,
  "total_followers": 42,
  "total_following": 23,
  "total_engagement": 64,
  "createdAt": "2023-04-12T14:21:33.456Z",
  "updatedAt": "2023-04-12T15:04:12.789Z"
}
```

- **404 Not Found** – User not found
```json
{
  "message": "User not found"
}
```

---

### Update User

**Endpoint:**  
`POST /api/user/update`

**Description:**  
Updates user data for a specific blockchain wallet address. If the user doesn't exist, a new user record is created. The total engagement metric is automatically calculated based on likes, comments, and followers.

**Payload:**  
```json
{
  "user_address": "<string>",
  "field": "<string>",
  "value": "<number>"
}
```

* `field` must be one of: `no_of_likes`, `no_of_comments`, `total_followers`, `total_following`
* `value` must be a number

**Example Request:**

```python
import requests

url = "http://localhost:3000/api/user/update"

payload = {
  "user_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "field": "total_followers",
  "value": 50
}

response = requests.post(url, json=payload)
print(response.status_code, response.json())
```

**Response:**  
- **200 OK** – Returns updated user data
```json
{
  "_id": "6142a8f9e6e7b34a5c8d9e7f",
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "no_of_likes": 15,
  "no_of_comments": 7,
  "total_followers": 50,
  "total_following": 23,
  "total_engagement": 72,
  "createdAt": "2023-04-12T14:21:33.456Z",
  "updatedAt": "2023-04-12T16:34:22.123Z"
}
```

- **400 Bad Request** – Missing or invalid fields
```json
{
  "message": "Missing required fields"
}
```

OR

```json
{
  "message": "Invalid field to update"
}
```

---

## Content Endpoints

### Get Content Info

**Endpoint:**  
`GET /api/content/{content_id}`

**Description:**  
Retrieves content information including comments, likes, and engagement metrics for a specific content item.

**Parameters:**  
- `content_id` (path parameter): Unique identifier for the content

**Example Request:**

```python
import requests

url = "http://localhost:3000/api/content/content_12345"

response = requests.get(url)
print(response.status_code, response.json())
```

**Response:**  
- **200 OK** – Returns content data
```json
{
  "_id": "6142b9f7c8a4d56e7f8a9b0c",
  "content_id": "content_12345",
  "comments": [
    {
      "user_address": "0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0",
      "text": "Great insights on blockchain technology.",
      "_id": "6142c0e8d9f0a1b2c3d4e5f6",
      "createdAt": "2023-04-12T15:45:12.345Z",
      "updatedAt": "2023-04-12T15:45:12.345Z"
    },
    {
      "user_address": "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      "text": "How does this affect the ecosystem?",
      "_id": "6142c1f0e1d2c3b4a5d6e7f8",
      "createdAt": "2023-04-12T15:49:36.789Z",
      "updatedAt": "2023-04-12T15:49:36.789Z"
    }
  ],
  "total_likes": 25,
  "total_engagement": 27,
  "createdAt": "2023-04-12T14:35:22.123Z",
  "updatedAt": "2023-04-12T15:49:36.789Z"
}
```

- **404 Not Found** – Content not found
```json
{
  "message": "Content not found"
}
```

---

### Update Content

**Endpoint:**  
`POST /api/content/update`

**Description:**  
Updates content information based on specified actions like adding likes, comments, or removing likes. Automatically creates content if it doesn't exist and updates relevant user metrics.

**Payload:**  
```json
{
  "content_id": "<string>",
  "action": "<string>",
  "data": "<object>"
}
```

* `action` must be one of: `add_like`, `add_comment`, `remove_like`
* `data` requirements depend on the action:
  * For `add_like`: `{ "user_address": "<string>" }`
  * For `add_comment`: `{ "user_address": "<string>", "text": "<string>" }`
  * For `remove_like`: `{ "user_address": "<string>" }`

**Example Requests:**

Adding a like:
```python
import requests

url = "http://localhost:3000/api/content/update"

payload = {
  "content_id": "content_12345",
  "action": "add_like",
  "data": {
    "user_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }
}

response = requests.post(url, json=payload)
print(response.status_code, response.json())
```

Adding a comment:
```python
import requests

url = "http://localhost:3000/api/content/update"

payload = {
  "content_id": "content_12345",
  "action": "add_comment",
  "data": {
    "user_address": "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
    "text": "This is a great explanation of blockchain principles."
  }
}

response = requests.post(url, json=payload)
print(response.status_code, response.json())
```

Removing a like:
```python
import requests

url = "http://localhost:3000/api/content/update"

payload = {
  "content_id": "content_12345",
  "action": "remove_like",
  "data": {
    "user_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }
}

response = requests.post(url, json=payload)
print(response.status_code, response.json())
```

**Response:**  
- **200 OK** – Returns updated content data
```json
{
  "_id": "6142b9f7c8a4d56e7f8a9b0c",
  "content_id": "content_12345",
  "comments": [
    {
      "user_address": "0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0",
      "text": "Great insights on blockchain technology.",
      "_id": "6142c0e8d9f0a1b2c3d4e5f6",
      "createdAt": "2023-04-12T15:45:12.345Z",
      "updatedAt": "2023-04-12T15:45:12.345Z"
    },
    {
      "user_address": "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      "text": "This is a great explanation of blockchain principles.",
      "_id": "6142d2g3h4i5j6k7l8m9n0o",
      "createdAt": "2023-04-12T16:02:45.678Z",
      "updatedAt": "2023-04-12T16:02:45.678Z"
    }
  ],
  "total_likes": 26,
  "total_engagement": 28,
  "createdAt": "2023-04-12T14:35:22.123Z",
  "updatedAt": "2023-04-12T16:02:45.678Z"
}
```

- **400 Bad Request** – Missing required fields or invalid action
```json
{
  "message": "Missing required fields"
}
```

OR

```json
{
  "message": "Invalid action type"
}
```

OR

```json
{
  "message": "Missing comment data"
}
```