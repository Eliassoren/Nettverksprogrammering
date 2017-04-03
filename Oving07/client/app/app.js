// @flow

import React from 'react';
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

class Menu extends React.Component {
  render() {
    return <div className="menu">Menu: <a id="customers-anchor" href="/#/"> Customers</a><a id="about-anchor"href="/#/about/"> About</a></div>;
  }
}

class CustomerService {
  static instance=null;
  lastId=0;
  customers=[];

  // Return singleton
  static get() {
    if(!CustomerService.instance)
      CustomerService.instance=new CustomerService();
    return CustomerService.instance;
  }

  /*constructor() {
    this.customers.push({id: ++this.lastId, name: "Ola", city: "Trondheim"});
    this.customers.push({id: ++this.lastId, name: "Kari", city: "Oslo"});
    this.customers.push({id: ++this.lastId, name: "Per", city: "Tromsø"});
  }*/

  // Returns a manually created promise since we are later going to use fetch(),
  // which also returns a promise, to perform an http request.
  getCustomers() {
   return fetch("/customers").then((response)=>{
     if(!response.ok) {
       throw response.statusText;
     }
     return response.json();
   });
 }

 getCustomer(customerId) {
   return fetch("/customers/"+customerId).then((response)=>{
     if(!response.ok) {
       throw response.statusText;
     }
     return response.json();
   });
 }


  addCustomer(name, city) {
  var body=JSON.stringify({name: name, city: city});
  return fetch("/customers", {method: "POST", headers: new Headers({'Content-Type': 'application/json'}), body: body.replace('"', '\"')}).then((response)=>{
    if(!response.ok) {
      throw response.statusText;
    }
    return response.json();
  });
}
editCustomer(customerId,name,city) {
  var body=JSON.stringify({id:customerId,name: name.replace('"', '\"'), city: city.replace('"', '\"')});
  return fetch("/customers",{method: "PUT", headers: new Headers({'Content-Type': 'application/json'}), body: body}).then((response)=>{
    if(!response.ok){
      throw response.statusText;
    }
    return response.json();
   });
}
deleteCustomer(customerId){
  var body = JSON.stringify({id:customerId});
  return fetch("/customers",{method: "DELETE", headers: new Headers({'Content-Type': 'application/json'}), body: body}).then((response)=>{
    if(!response.ok){
      throw response.statusText;
    }
    return response.json();
  });
}
  /*deleteCustomer(customerId) {
    return new Promise((resolve,reject)=>{
      if(!customerId){
        reject("No customer");
      }
      var found = false;
      for(var c=0;c<this.customers.length;c++) {
        if(this.customers[c].id==customerId) {
          found = true;
          this.customers.splice(c,1);
          resolve(c);
          return;
        }
      }
        if(!found){
        reject("customer not found");
      }
     });
  }*/
  /*
  editCustomer(customerId,name,city) {
    return new Promise((resolve,reject)=>{
      if(!customerId){
        reject("No customer");
      }else if(!name && !city){
        reject("Empty input");
      }else{
        var found = false;
        for(var c=0;c<this.customers.length;c++) {
          if(this.customers[c].id==customerId) {
            found = true;
            this.customers[c].name = name;
            this.customers[c].city = city;
            resolve(c);
            return;
          }
        }
          if(!found){
          reject("customer not found");
        }
      }

     });
  }
  */
}

class CustomerListComponent extends React.Component {
  state={status: "", customers: [], newCustomerName: "", newCustomerCity: ""}

  constructor() {
    super();

    CustomerService.get().getCustomers().then((result)=>{
      this.setState({status: "successfully loaded customer list", customers: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }

  // Event methods, which are called in render(), are declared as properties:
  onNewCustomerFormChanged = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  // Event methods, which are called in render(), are declared as properties:
  onNewCustomer = (event) => {
    event.preventDefault();
    var name=this.state.newCustomerName;
    var city=this.state.newCustomerCity;
    CustomerService.get().addCustomer(name, city).then((result)=>{
      this.state.customers.push({id: result, name: name, city});
      this.setState({status: "successfully added new customer", customers: this.state.customers, newCustomerName: "", newCustomerCity: ""});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }

  render() {
    var listItems = this.state.customers.map((customer) =>
      <li key={customer.id}><a href={"/#/customer/"+customer.id}>{customer.name}</a></li>
    );
    return <div>status: {this.state.status}<br/><ul>{listItems}</ul>
        <form onSubmit={this.onNewCustomer} onChange={this.onNewCustomerFormChanged}>
          <label>Name:<input type="text" name="newCustomerName" value={this.state.newCustomerName} /></label>
          <label>City:<input type="text" name="newCustomerCity" value={this.state.newCustomerCity} /></label>
          <input type="submit" value="New Customer"/>
        </form>
      </div>
  }
}
class AboutComponent extends React.Component{
  constructor(){
    super();
  }
  render(){
    return <div><p>Dette er en about</p></div>
  }
}
class CustomerDetailsComponent extends React.Component {
  state={status: "", customer: {}, editCustomerName: "", editCustomerCity: ""}

  constructor(props) {
    super(props);

    CustomerService.get().getCustomer(props.params.customerId).then((result)=>{
      this.setState({status: "successfully loaded customer details", customer: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  onDeleteCustomer = (event) => {
    event.preventDefault();
    var customerId = this.state.customer.id;
    CustomerService.get().deleteCustomer(customerId).then((result)=>{
      //this.state.customers.splice(result,1);
      this.setState({status:"Successfully deleted customer"});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  onEditCustomer = (event) => {
    event.preventDefault();
    var id = this.state.customer.id;
    var name = this.state.editCustomerName;
    var city = this.state.editCustomerCity;
    CustomerService.get().editCustomer(id, name, city).then((result)=>{
      //this.state.customers.push({id: result, name: name, city});
      this.setState({status: "successfully edited customer"});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  onEditCustomerFormChanged = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }
  render() {
    return <div>status: {this.state.status}<br/>
      <ul>
        <li>name: {this.state.customer.name}</li>
        <li>city: {this.state.customer.city}</li>
      </ul>
      <form onSubmit = {this.onDeleteCustomer}>
      <input id ="delete" name="deleteCustomer" type="submit" value="Delete Customer"/>
      </form>
      <h2>Edit customer</h2>
      <form onSubmit = {this.onEditCustomer} onChange={this.onEditCustomerFormChanged}>
      <label>Name:<input type="text" name="editCustomerName" value={this.state.editCustomerName} /></label>
      <label>City:<input type="text" name="editCustomerCity" value={this.state.editCustomerCity} /></label>
      <input id="edit" name ="editCustomer" type ="submit" value="Submit"/>
      </form>
    </div>
  }
}

class Routes extends React.Component {
  render() {
    return <Router history={hashHistory}>
      <Route exact path="/" component={CustomerListComponent}/>
      <Route path="/customer/:customerId" component={CustomerDetailsComponent}/>
      <Route path="/about/" component={AboutComponent}/>
    </Router>;
  }
}

render(<div>
  <Menu/>
  <Routes/>
</div>, document.getElementById('root'));
