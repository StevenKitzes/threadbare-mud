# threadbare-mud
A game project to teach myself some new techniques and -ologies.

## How to run
This project has `npm` and `node` as dependencies.  (Currently recommending Node v18, as some project dependencies are broken on higher versions of Node as of my latest testing.)

Once you've got the system dependencies and pulled the repo to local, you'll need to install project dependencies.  From the project root `/`, run `npm install`.  Then, navigate to the socket-server directory `/src/socket-server` and run `npm install` there as well.

Next, make your `.env.local` file.  Copy the existing `.env.example` file as a starting point (keep it in the project root), and make sure you set `JWT_SECRET` to a string of your choosing.  I recommend a complex hash if you are worried about security, but any alphanumeric string will do.

Next, you'll need to get the database set up.  A script is provided for this.  You can run `npm run hydrate` and this will create the database.  You can run this command any time to reset the DB to a clean state.

Finally, run `npm run all` and you will be off to the races.  Visit `http://localhost:3000` to see the game in action.
