import { HttpClient } from '@angular/common/http';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../_models/group';
import { Message } from '../_models/mesage';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationhelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl= environment.apiUrl;
  hubUrl = environment.hubUrl;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable()

  private hubConnection : HubConnection;
  constructor(private http : HttpClient) { }

  createHubConnection(user: User, otherUsername){
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
     accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build()
    
    this.hubConnection.start().catch(err => console.log(err))

    this.hubConnection.on("ReceiveMessageThread", messages => {
      this.messageThreadSource.next(messages);
    })
    this.hubConnection.on("NewMessage", message => {
      this.messageThread$.pipe(take(1)).subscribe(messages =>{
        this.messageThreadSource.next([...messages, message])
      })
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if(group.connections.some(x=> x.username === otherUsername)){
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(msg =>{
            if(!msg.dateRead){
                 msg.dateRead = new Date(Date.now())
            }
          })
          this.messageThreadSource.next([...messages]);
        })

      }
    })
  }

  stopHubConnection(){
    console.log("before");

    if(this.hubConnection){
      console.log("after");
      this.hubConnection.stop();
    }
  }

  getMessages(pageNumber, pageSize, container)
  {
     let params = getPaginationHeaders(pageNumber, pageSize);
     params = params.append('Container', container);
     return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }
 getMessageThread(username: string){
  return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username)
 }
// async to garantie we get a promise 
  async sendMessage(username: string, content: string){
   //return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content})
   return this.hubConnection.invoke('SendMessage', {recipientUsername: username, content}).catch(error => console.log(error));
 }

 deleteMessage(id: number){
  return this.http.delete(this.baseUrl + 'messages/' +id);
 }

}
