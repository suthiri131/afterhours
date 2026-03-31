Afterhours Website

Afterhours is a movie watchlist and review web application where users can keep track of movies they want to watch, 
mark them as watched, and leave ratings and reviews.

This project is built as part of a group assignment and focuses on implementing core CRUD functionalities using Node.js, Express, and MongoDB.


Getting Started

1. Extract the zipped folder onto your desktop
2. Open the folder that you have extracted on Visual Studio Code
    - Open terminal and make sure that you are in the afterhours folder
    - If you are not already in the folder, make sure to navigate to it using cd.
3. Install dependencies - npm i
4. Run the server - nodemon server.js
5. Go to http://localhost:8000/index.html on your desired web browser.
6. Welcome to our website!


Account Credentials

SuperAdmin
Email: superadmin@gmail.com
Password: superadmin123!!

Admin
Email: admin@gmail.com
Password: admin123!!

User1
Email: userone@gmail.com
Password: userone123!!

User2
Email: usertwo@gmail.com
Password: usertwo123!!

User3
Email: userthree@gmail.com
Password: userthree123!!


Website Features

1. Login/Registration Page
- Access the website from one of our provided accounts
- You may also choose to create a user account, please use our provided SuperAdmin and Admin accounts to test SuperAdmin and Admin features
* If you choose to create your own user account, please use an email that you have access to as you will be prompted for OTP verification

2. Super Admin Manage Users Page (Only accessible by SuperAdmin)
- Manage user roles and permissions

3. Admin Movie Management Main Page (Only accessible by Admin)
- Add new movies to the website
- Edit movie details
- Delete movie

4. Manage Genres Page (Only accessible by Admin)
- Add Genre
- Edit Genre
- Delete Genre

5. All Movies Page
- Shows users all the movies
- Show users trending movies by views and ratings
- Users can add movies to watchlist
- Users can search for movies
- Users can filter movies by genre
- Clicking on movie shows reviews & ratings for movie

6. Movies Watchlist Page
- Users can remove movies from their watchlist
- Users can mark movies as watched and then leave a review/rating

7. Reviews & Ratings Page
- Users can leave reviews and rate movies they have watched
- Only allowed after marking movie as “Watched”
- One review per user per movie
- Users can create, edit, and delete their own reviews
- Reviews include category ratings (Story, Acting, Music, Rewatch) with - auto-calculated overall rating
- Displays average rating, total reviews and suggested movies on Movie Details page
- Prevents unauthorized access and handles invalid inputs

8. Profile Page
- Users can change their password
- Users can delete their account
- Users can log out