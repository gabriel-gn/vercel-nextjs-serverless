import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const query = request.query;
    const availableLangs = ['en_us', 'pt_br'];

    let lang = query?.lang
      ? `${query.lang}`.toLowerCase().replace('-', '_')
      : 'en_us';
    lang = availableLangs.includes(lang) ? lang : 'en_us';

    global.lang = lang;

    return next.handle();
  }
}
