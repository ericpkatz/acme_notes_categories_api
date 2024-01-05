const express = require('express');
const app = express();

app.get('/api/categories', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT *
      FROM categories
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/notes', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT *
      FROM notes 
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_categories_db');

const init = async()=> {
  await client.connect();
  let SQL = `
    DROP TABLE IF EXISTS notes;
    DROP TABLE IF EXISTS categories;
    CREATE TABLE categories(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE notes(
      id SERIAL PRIMARY KEY,
      txt VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now(),
      ranking INTEGER NOT NULL DEFAULT 5,
      category_id INTEGER REFERENCES categories(id) NOT NULL
    );
  `;
  await client.query(SQL);
  console.log('tables created');
  SQL = `
    INSERT INTO categories(name) VALUES('SQL');
    INSERT INTO categories(name) VALUES('Express');
    INSERT INTO categories(name) VALUES('Shopping');
    INSERT INTO notes(txt, category_id) VALUES('Learn About Foreign Keys', (SELECT id FROM categories WHERE name='SQL'));
    INSERT INTO notes(txt, category_id) VALUES('Learn About Unique Constraints', (SELECT id FROM categories WHERE name='SQL'));
    INSERT INTO notes(txt, category_id) VALUES('Learn About Error Handling', (SELECT id FROM categories WHERE name='Express'));
    INSERT INTO notes(txt, category_id) VALUES('Buy Milk', (SELECT id FROM categories WHERE name='Shopping'));
    INSERT INTO notes(txt, category_id) VALUES('Buy Bread', (SELECT id FROM categories WHERE name='Shopping'));
  `;
  await client.query(SQL);
  console.log('data seeded');
  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();
