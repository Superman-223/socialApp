import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/Pagination';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  paginatedResult : PaginatedResult<Member> = new PaginatedResult<Member>();
  constructor(private http: HttpClient) {
  }
  getMembers(page? : number, itemsPerPage?: number) {

    let params= new HttpParams();

    if(page !== null && itemsPerPage !== null){
      params = params.append('pageNumber', page.toString() );
      params = params.append('pageSize', itemsPerPage.toString() );
    }
    //if(this.members.length> 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).pipe(
      map(response => {
        this.paginatedResult.result = response.body;
        if(response.headers.get('Pagination') !== null ){
          this.paginatedResult.pagination = JSON.parse(response.headers.get('pagination'));
        }
        return this.paginatedResult;
      })
    //  tap(members => this.members =members)
     );
  }
  getMember(username: string) {
    const member = this.members.find(x=>x.username == username);
    if(member !== undefined) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      tap(()=> {
        const index = this.members.indexOf(member);
        this.members[index]= member;
      })
    );
  }

  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/'+photoId, {});
  }

  deletePhoto(photoId : number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/'+ photoId);
  }

}
