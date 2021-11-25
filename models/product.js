const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title,price,description,imageUrl,id,userId){
    this.title=title;
    this.price=price;
    this.description=description;
    this.imageUrl=imageUrl;
    this._id = id? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save(){
    const db = getDb();
    let dpOp;
    if(this._id){
      dpOp = db.collection('products').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:this});
    }
    else{
      dpOp = db.collection('products').insertOne(this);
    }
    return dpOp
    .then(result=>{
      console.log(result);
    })
    .catch(err=>{
      console.log(err);
    })
  }

  static fetchAll(){
    const db = getDb();
    return db.collection('products').find().toArray().then(products=>{
      console.log('products fetched!!!');
      return products;
    })
    .catch(err=>{
      console.log(err);
    });
  }

  static findById(id){
    const db = getDb();
    return db.collection('products').find({_id:new mongodb.ObjectId(id)}).next()
    .then(product=>{
      console.log(product);
      return product;
    })
    .catch(err=>{
      console.log(err);
    })
  }

  static deleteById(id){
    const db = getDb();
    return db.collection('products').deleteOne({_id:new mongodb.ObjectId(id)});
  }
}

module.exports = Product;