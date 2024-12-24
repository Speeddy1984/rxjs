import { Injectable } from "@nestjs/common";
import { firstValueFrom, toArray, from, map, mergeAll, take, Observable, catchError } from "rxjs";
import axios from "axios";

@Injectable()
export class RxjsService {
  private readonly githubURL = "https://api.github.com/search/repositories?q=";
  private readonly gitlabURL = "https://gitlab.com/api/v4/projects?search=";

  private fetchRepositories(text: string, hub: 'github' | 'gitlab', count: number): Observable<any> {
    const url = hub === 'github' ? `${this.githubURL}${text}` : `${this.gitlabURL}${text}`;
    
    return from(axios.get(url)).pipe(
      map((res: any) => (hub === 'github' ? res.data.items : res.data)),
      mergeAll(),
      take(count),
      catchError((err) => {
        console.error('Ошибка при выполнении запроса:', err.message);
        throw new Error('Ошибка при обращении к API');
      })
    );
  }

  async searchRepositories(text: string, hub: 'github' | 'gitlab'): Promise<any> {
    const data$ = this.fetchRepositories(text, hub, 10).pipe(toArray());
    return await firstValueFrom(data$);
  }
}
