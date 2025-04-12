**Key Features:**
- Full CRUD operations for user engagement tracking
- Atomic updates using MongoDB operators ($addToSet, $push)
- Error handling for missing data
- Concurrent updates using Promise.all()
- Automatic engagement score calculation

**Usage Examples:**

1. **Create User**
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "wallet_address": "user1",
  "name": "John Doe"
}' http://localhost:3000/api/users

curl -X POST -H "Content-Type: application/json" -d '{
  "wallet_address": "user2",
  "name": "John Doe"
}' http://localhost:3000/api/users1
```

1.5 **Create Post**
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "warlus_blob_id": "post123",
  "creator_id": "user1"
}' http://localhost:3000/api/posts
```

2. **Like Content**
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "wallet_address": "user1",
  "warlus_blob_id": "post123"
}' http://localhost:3000/api/like
```

3. **Add Comment**
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "wallet_address": "user1",
  "warlus_blob_id": "post123",
  "comment_text": "Great post!"
}' http://localhost:3000/api/comment
```

4. **Follow User**
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "wallet_address": "user1",
  "target_wallet_address": "user2"
}' http://localhost:3000/api/follow
```

5. **Get User Engagement**
```bash
curl http://localhost:3000/api/total_user_engagement/user1
```

6. **Get Post Engagement**
```bash
curl http://localhost:3000/api/total_post_engagement/post123
```

**Note:** Make sure to create Content documents directly in MongoDB before testing like/comment endpoints:
```javascript
// Example Content creation in MongoDB
{
  _id: "post123",
  creator_id: "user2",
  likes: [],
  comments: []
}
```