import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_models/mesage';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberMessagesComponent implements OnInit {
@Input() username : string;
@Input() messages: Message[];
@ViewChild('messageForm') messageForm : NgForm;
messageContent : string;
loading = false;

  constructor(public messageService : MessageService) { }

  ngOnInit(): void {
     //this.loadMessages();
  }

  sendMessage(){
    this.loading = true;
    this.messageService.sendMessage(this.username, this.messageContent).then(()=>{
      //this.messages.push(message);
      this.messageForm.reset();
    }).finally(()=> this.loading = false);
  }

  //loadMessages(){
  // this.messageService.getMessageThread(this.username).subscribe(messages => {
  // this.messages = messages;
//})
//}
}
