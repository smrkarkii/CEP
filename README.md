# 1. Project Description:

# Blockchain User Content API Requirements

## Database Schema

### User Schema
- `address` <String> (Primary Key)
- `no_of_likes` <Number>
- `no_of_comments` <Number>
- `total_followers` <Number>
- `total_following` <Number>
- `total_engagement` <Number>

### Content Schema
- `content_id` <String> (Primary Key)
- `comments` <Array>
- `total_likes` <Number>
- `total_engagement` <Number>

## API Endpoints

### GET Endpoints

#### Get User Data
```
GET /api/user/{user_address}
```
**Parameters:**
- `user_address` <String> - Blockchain wallet address of the user

**Returns:**
- User information including likes, comments, followers, following, and total engagement
- Status code 200 on success
- Status code 404 if user not found

#### Get Content Info
```
GET /api/content/{content_id}
```
**Parameters:**
- `content_id` <String> - Unique identifier for the content

**Returns:**
- Content information including comments, likes, and total engagement
- Status code 200 on success
- Status code 404 if content not found

### POST Endpoints

#### Update User
```
POST /api/user/update
```
**Request Body:**
```json
{
  "user_address": "<String>",
  "field": "<String>",
  "value": "<any>"
}
```
- `user_address`: Blockchain wallet address of the user
- `field`: Field to update ('following', 'followers', etc.)
- `value`: New value for the field

**Returns:**
- Updated user data
- Status code 200 on success
- Status code 400 for invalid request
- Status code 404 if user not found

#### Update Content
```
POST /api/content/update
```
**Request Body:**
```json
{
  "content_id": "<String>",
  "action": "<String>",
  "data": "<any>"
}
```
- `content_id`: Unique identifier for the content
- `action`: Action type ('add_like', 'add_comment', etc.)
- `data`: Data related to the action (e.g., comment text)

**Returns:**
- Updated content data
- Status code 200 on success
- Status code 400 for invalid request
- Status code 404 if content not found










