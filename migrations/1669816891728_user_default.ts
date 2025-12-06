import { Db } from 'mongodb'
import { MigrationInterface } from 'mongo-migrate-ts';
import configs from '../src/configs';
const mongoose = require('mongoose')
mongoose.set('strictQuery', false) // https://mongoosejs.com/docs/guide.html#strictQuery
require('dotenv').config()

const bcryptjs = require('bcryptjs')
const salt = bcryptjs.genSaltSync()

export class user_default1669816891728 implements MigrationInterface {
  public async up(db: Db): Promise<any> {
    db.collection('users').countDocuments().then(res => {
      const {name, email, password} = configs.user_default
      if(res === 0 )
      {
        db.collection('users').insertOne({
          name,
          email,
          password: bcryptjs.hashSync(password, salt),
          role: "ADMIN_ROLE",
          status: true,
          __v: 0
        }).then(res => {
          console.log(JSON.stringify(res));
        })
        .catch(error => {
          console.log(JSON.stringify(error));
        });
      }
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    });
  }

  public async down(db: Db): Promise<any> {
    const {name, email} = configs.user_default
    db.collection('users').deleteOne({
      name,
      email,
      role: "ADMIN_ROLE",
      status: true,
      __v: 0
    }).then(res => {
      console.log(JSON.stringify(res));
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    });
  }
}
