import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router,  } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/mesage';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';
import  {take} from 'rxjs/operators';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
galleryOptions: NgxGalleryOptions[];
galleryImages: NgxGalleryImage[];
member : Member;
messages: Message[] = [];
user : User;
// static true, so that when the component load, it will be very fast in the loading
@ViewChild('memberTabs', {static : true}) memberTabs: TabsetComponent;
activeTab: TabDirective;

constructor(private messageService : MessageService,
   public presence : PresenceService, 
   private route: ActivatedRoute,
   private accountService : AccountService,
   private router: Router) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe(user=> this.user = user);
    this.router.routeReuseStrategy.shouldReuseRoute = ()=> false;
   }


  ngOnInit(): void {
    this.route.data.subscribe(data =>{
      this.member = data.member;
      this.galleryImages = this.getImages();
    })
    this.route.queryParams.subscribe(params =>{
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    })
    //this.loadMember();
    this.galleryOptions = [
      {
        width:'500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]
  }
  getImages(): NgxGalleryImage[]{
    const imageUrls = [];
    for(const photo of this.member.photos){
      imageUrls.push({
        small : photo?.url,
        medium: photo?.url,
        big: photo?.url
      })
    }
    return imageUrls;
  }
onTabActivated(data: TabDirective)
{
this.activeTab = data;
if(this.activeTab.heading === 'Messages' && this.messages.length === 0){

this.messageService.createHubConnection(this.user, this.member.username);
//  this.loadMessages(); => no need because of Signal R implementation
}else{
  this.messageService.stopHubConnection();
}
}
  loadMessages(){
   this.messageService.getMessageThread(this.member.username).subscribe(messages => {
   this.messages = messages;
})
}

selectTab(tabId :number){
  this.memberTabs.tabs[tabId].active = true;
}
//loadMember(){
 // this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => {
 //   this.member = member;
 // })
//}

ngOnDestroy(): void {
  this.messageService.stopHubConnection();
}
}
