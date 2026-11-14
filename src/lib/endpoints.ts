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
