# The Backend
 - Basic Back-end for managing likes, comments, and follows between user and posts

* Please Refer to docs/docs.md for more details about endpoints

## ⚙️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone -b the-backend --single-branch https://github.com/smrkarkii/CEP.git
   cd CEP
   ```

2. **Configure Environment Variables**  
   Create a `.env` file in the root directory:
   ```dotenv
   MONGODB_URI=<your-mongodb-uri>
   PORT=3000
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the server**

   - **Development mode (with live reload):**
     ```bash
     npm run dev
     ```

   - **Production mode:**
     ```bash
     npm run start
     ```
---

# Database Schema

### Creator Schema
- `wallet_address` <String> (Primary Key)
- `name` <String>
- `followers` <list: wallet_address>
- `likes` <list: warlus_blob_id: which is post id>
- `comments` <list: {wallet_address, comment_text}>
- `following` <list: wallet_address>
- `total_engagement` <Number> = len(likes) + len(comments) + len(following)


### Content Schema
- `warlus_blob_id` <String> (Primary Key)
- `creator_id` <String>: who created it
- `likes` <list: wallet_address: list of people who liked>
- `comments` <list: {wallet_address, comment_text}>
- `total_engagement` <Number>: len(likes) + len(comments)

## API Endpoints
Add user
 - required: wallet_address, name
 - optional: followers=0, likes=0, comments=[], following=[]

Like
 - required: wallet_address, warlus_blob_id
 
comments
 - required: wallet_address, warlus_blob_id, comment_text

follow
 - required: wallet_address, target_wallet_address

total_user_engagement
 - required: wallet_address
 - returns: integer: len(likes) + len(comments) + len(following) for given wallet address

total_post_engagement
 - required: warlus_blob_id
 - returns: integer: len(likes) + len(comments) for given warlus_blob_id

