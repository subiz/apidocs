export type ApiEndpoint = {id:string; method:'GET'|'POST'; path:string; summary:string; status:'verified'; request:string};
export const endpoints:Record<string,ApiEndpoint>={};
function requestEndpoint(input:{id:string;method:'GET'|'POST';path:string;summary:string;status:'verified';body:unknown}):ApiEndpoint {
 const url='https://api.subiz.com.vn'+input.path.replace(/\{(\w+)\}/g,(_,key)=>'YOUR_'+key.toUpperCase());
 const body=input.body===null?undefined:JSON.stringify(input.body,null,2);
 const request=[`${input.method} ${url}`, 'Authorization: Bearer YOUR_ACCESS_TOKEN', ...(body?['Content-Type: application/json', '', body]:[])].join('\n');
 return {...input,request};
}

endpoints["users-create"]=requestEndpoint({"id": "users-create", "method": "POST", "path": "/4.0/users", "summary": "Create a user", "status": "verified", "body": {"attributes": [{"key": "fullname", "text": "Alex Example"}]}});

endpoints["users-retrieve"]=requestEndpoint({"id": "users-retrieve", "method": "GET", "path": "/4.0/users/{uid}", "summary": "Retrieve a user", "status": "verified", "body": null});

endpoints["users-update"]=requestEndpoint({"id": "users-update", "method": "POST", "path": "/4.1/users/{uid}", "summary": "Update a user", "status": "verified", "body": {"attributes": [{"key": "fullname", "text": "Alex Example"}]}});

endpoints["users-identity"]=requestEndpoint({"id": "users-identity", "method": "POST", "path": "/4.1/accounts/{accid}/contact-profiles/{channel}/sources/{source}/{id}", "summary": "Find or create by channel identity", "status": "verified", "body": {}});

endpoints["conversations-retrieve"]=requestEndpoint({"id": "conversations-retrieve", "method": "GET", "path": "/4.0/conversations/{cid}", "summary": "Retrieve a conversation", "status": "verified", "body": null});

endpoints["conversations-history"]=requestEndpoint({"id": "conversations-history", "method": "GET", "path": "/4.0/conversations/{cid}/messages", "summary": "Read message history", "status": "verified", "body": null});

endpoints["conversations-invite-agent"]=requestEndpoint({"id": "conversations-invite-agent", "method": "POST", "path": "/4.0/conversations/{cid}/members", "summary": "Invite an agent", "status": "verified", "body": {"type": "agent", "id": "YOUR_AGENT_ID"}});

endpoints["conversations-assign-agent"]=requestEndpoint({"id": "conversations-assign-agent", "method": "POST", "path": "/4.0/accounts/{accid}/conversations/{cid}", "summary": "Assign an agent", "status": "verified", "body": {"assignee": "YOUR_AGENT_ID"}});


endpoints["conversations-list"]=requestEndpoint({"id": "conversations-list", "method": "GET", "path": "/4.1/conversations?user_id=YOUR_USER_ID&limit=20", "summary": "List conversations", "status": "verified", "body": null});

endpoints["messages-send-to-user"]=requestEndpoint({"id": "messages-send-to-user", "method": "POST", "path": "/4.0/accounts/{accid}/users/{uid}/messages", "summary": "Send a message to a user", "status": "verified", "body": {"messages": [{"type": "message_sent", "touchpoint": {"channel": "YOUR_CHANNEL", "source": "YOUR_SOURCE", "id": "YOUR_PROFILE_ID"}, "data": {"message": {"text": "Hello! How can we help?", "format": "plaintext"}}}]}});

endpoints["messages-send"]=requestEndpoint({id:"messages-send",method:"POST",path:"/4.1/conversations/{cid}/messages",summary:"Send a text message",status:"verified",body:{type:"message_sent",data:{message:{text:"Hello! How can we help?",format:"plaintext"}}}});

endpoints["agents-list"]=requestEndpoint({id:"agents-list",method:"GET",path:"/4.1/agents",summary:"List agents",status:"verified",body:null});

endpoints["agents-retrieve"]=requestEndpoint({id:"agents-retrieve",method:"GET",path:"/4.0/agents/{agid}",summary:"Get agent details",status:"verified",body:null});

endpoints["orders-create"]=requestEndpoint({id:"orders-create",method:"POST",path:"/4.0/accounts/{accid}/orders",summary:"Create an order",status:"verified",body:{source_id:"YOUR_SOURCE_ORDER_ID",user:{id:"YOUR_USER_ID"},currency:"VND",items:[{quantity:2,product:{name:"Ceramic mug",sku:"MUG-01",price:120000}}],shipping:{address:{fullname:"Alex Example",phone:"+84900000000",address:"12 Example Street",region:"Ho Chi Minh City",country_code:"VN"},nominal_fee:30000}}});

endpoints["orders-list"]=requestEndpoint({id:"orders-list",method:"POST",path:"/4.0/accounts/{accid}/orders-search",summary:"List orders",status:"verified",body:{user_id:"YOUR_USER_ID",statuses:["open","closed"],order_by:"created desc",limit:50,offset:0}});

endpoints["orders-retrieve"]=requestEndpoint({id:"orders-retrieve",method:"GET",path:"/4.0/accounts/{accid}/orders/{oid}",summary:"Get order details",status:"verified",body:null});

endpoints["orders-update"]=requestEndpoint({id:"orders-update",method:"POST",path:"/4.0/accounts/{accid}/orders/{oid}?x-fields=status,note",summary:"Update an order",status:"verified",body:{status:"closed",note:"Customer confirmed by phone."}});

endpoints["products-create"]=requestEndpoint({id:"products-create",method:"POST",path:"/4.0/accounts/{accid}/products",summary:"Create a product",status:"verified",body:{source_id:"YOUR_SOURCE_PRODUCT_ID",name:"Ceramic mug",sku:"MUG-01",price:120000,currency:"VND",stock:25,availability:"in_stock"}});

endpoints["products-list"]=requestEndpoint({id:"products-list",method:"POST",path:"/4.0/accounts/{accid}/products-search",summary:"List products",status:"verified",body:{query:"mug",visibility:"published",limit:100}});

endpoints["products-retrieve"]=requestEndpoint({id:"products-retrieve",method:"GET",path:"/4.0/accounts/{accid}/products/{pid}",summary:"Get product details",status:"verified",body:null});

endpoints["products-update"]=requestEndpoint({id:"products-update",method:"POST",path:"/4.0/accounts/{accid}/products/{pid}?x-fields=price,stock",summary:"Update a product",status:"verified",body:{name:"Ceramic mug",price:99000,stock:40}});
