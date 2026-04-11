import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ResetPasswordConfirmDto,
  ResetPasswordRequestDto,
} from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  logout() {
    // JWT is stateless; the client simply discards the token. This endpoint
    // exists so the frontend has a symmetric /auth/logout call that the API
    // can later extend with token blacklisting.
    return { ok: true };
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post('reset-password/confirm')
  @HttpCode(200)
  confirmReset(@Body() dto: ResetPasswordConfirmDto) {
    return this.auth.confirmPasswordReset(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.currentUser(user.id);
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'auth' };
  }
}
