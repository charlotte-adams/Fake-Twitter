PRAGMA foreign_keys = ON; 
.mode column
.headers on



CREATE TABLE User (
	login TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	profile_pic TEXT DEFAULT 'http://unloop.edu/q1/easygallery/photos/young-avatar/boy-4.png'
	);



INSERT INTO User VALUES
	('bugs', 'bunny', 'http://unloop.edu/q1/easygallery/photos/young-avatar/boy-1.png'),
	('elmer', 'fudd', 'http://unloop.edu/q1/easygallery/photos/young-avatar/boy-3.png');

INSERT INTO User (login, password) VALUES ('daffy', 'duck'); 
	
	
CREATE TABLE Following ( 
	follower TEXT REFERENCES User(login),
	feed TEXT REFERENCES User(login)
	);


INSERT INTO Following VALUES
	('bugs', 'elmer'),
	('bugs', 'daffy'),
	('elmer', 'bugs'),
	('daffy', 'bugs');


CREATE TABLE Tweet (
	tweet_id INTEGER PRIMARY KEY,
	user TEXT REFERENCES User(login),
	message TEXT,
	post_time TEXT DEFAULT CURRENT_TIMESTAMP
	); 

INSERT INTO Tweet (user, message) VALUES 
	("bugs", "What's up, doc?"),
	("elmer", "Shh. I'm hunting wabbits!"),
	("bugs", "What do you mean, wabbits?"),
	("elmer", "You know, with big wong ears, and a wittle white fwuffy tail, and he hops awound and awound!"),
	("bugs", "Listen, Doc. Confidentially, I AM A WABBIT!");






SELECT * FROM Tweet; 

.save fake-twitter.sqlt