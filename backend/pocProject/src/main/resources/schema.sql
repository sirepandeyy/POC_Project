CREATE TABLE messages(
id serial primary key;
chat_id UUID not null,
content TEXT not null;
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
);