/* const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING
}); */
const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User{
  constructor(username,email,cart,id){
    this.name=username;
    this.email=email;
    this.cart=cart;
    this._id=id;
  }

  save(){
    const db = getDb();
    return db.collection('users').insertOne(this);
    /* .then(result=>{
      console.log(result);
    })
    .catch(err=>{
      console.log(err);
    }) */
  }

  addToCart(product){
    //product.quantity=1;
    let updatedCart;
    if(this.cart.items){
      const cartProductIndex = this.cart.items.findIndex(item=>{
        return item.productId.toString()===product._id.toString();
      });
      console.log('we are printing index here '+cartProductIndex);
      if(cartProductIndex>=0){
        this.cart.items[cartProductIndex].quantity=this.cart.items[cartProductIndex].quantity+1;
      }
      else{
        this.cart.items.push({productId:product._id,quantity:1});
      }
      updatedCart=this.cart;
    }
    else{
      updatedCart = {items:[{productId:product._id,quantity:1}]};
    }
    //const updatedCart = {items:[{productId:product._id,quantity:1}]};
    const db = getDb();
    return db.collection('users').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:{cart:updatedCart}});
  }

  getCart(){
    const db=getDb();
    const productIds = this.cart.items.map(i=>{
      return i.productId;
    });
    return db.collection('products').find({_id:{$in:productIds}}).toArray().then(products=>{
      return products.map(p=>{
        return {...p,quantity:this.cart.items.find(y=>{
          return y.productId.toString()===p._id.toString()
        }).quantity}
      })
    })
    .catch(err=>{
      console.log(err);
    });
  }

  deleteProductInCart(id){
    const db=getDb();
    let productIndex = this.cart.items.findIndex(prod=>{
      return prod.productId.toString()===id.toString();
    })
    let arr = this.cart.items;
    console.log(arr.toString()+' index is  '+productIndex)
    arr.splice(productIndex,1);
    let updatedCart = {items:arr};
    return db.collection('users').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:{cart:updatedCart}});
  }

  addOrder(){
    const db = getDb();
    return this.getCart().then(products=>{
      const order = {
        items:products,
        user:{
          _id:new mongodb.ObjectId(this._id),
          name:this.name
        }
      };
      return db.collection('orders').insertOne(order);  
    })
    .then(cart=>{
      this.cart={items:[]};
      return db.collection('users').updateOne({_id:new mongodb.ObjectId(this._id)},{$set:{cart:{items:[]}}})
    })
  }

  getOrders(){
    const db = getDb();
    return db.collection('orders').find({'user._id':new mongodb.ObjectId(this._id)}).toArray();
  }

  static findById(userId){
    const db = getDb();
    return db.collection('users').findOne({_id:mongodb.ObjectId(userId)});
    /* .then(user=>{
      console.log(user);
      return user;
    })
    .catch(err=>{
      console.log(err);
    }) */
  }
}

module.exports = User;
