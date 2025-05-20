import { All, Body, Controller, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthProxyService } from '../services/auth-proxy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/interfaces/user-role.enum';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @All('register')
  register(@Body() body: any, @Req() req: Request): Observable<any> {
    return this.authProxyService.request(
      req.method,
      req.url,
      body,
      req.headers,
    );
  }

  @All('login')
  login(@Body() body: any, @Req() req: Request): Observable<any> {
    return this.authProxyService.request(
      req.method,
      req.url,
      body,
      req.headers,
    );
  }

  @All('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithUser): Observable<any> {
    return this.authProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('validate')
  validateToken(@Body() body: any, @Req() req: Request): Observable<any> {
    return this.authProxyService.request(
      req.method,
      req.url,
      body,
      req.headers,
    );
  }

  @All('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  getAllUsers(@Req() req: RequestWithUser): Observable<any> {
    return this.authProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('users/:id')
  @UseGuards(JwtAuthGuard)
  getUser(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.authProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.authProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }
}
